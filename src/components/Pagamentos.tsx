import { useState, FormEvent } from 'react';
import { Pagamento, Aluno, Curso } from '../types';
import { formatCurrency } from '../utils/kpiCalculator';
import { Plus, Check, Calendar, User, BookOpen, DollarSign, Search, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface PagamentosProps {
  pagamentos: Pagamento[];
  alunos: Aluno[];
  cursos: Curso[];
  onAddPagamento: (pagamento: Omit<Pagamento, 'id'>) => void;
  onUpdateStatusPagamento: (id: string, status: 'Pago' | 'Pendente' | 'Atrasado') => void;
  onDeletePagamento: (id: string) => void;
}

export default function Pagamentos({ 
  pagamentos, 
  alunos, 
  cursos, 
  onAddPagamento, 
  onUpdateStatusPagamento, 
  onDeletePagamento 
}: PagamentosProps) {
  
  const [busca, setBusca] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  // Form State
  const [alunoId, setAlunoId] = useState('');
  const [valor, setValor] = useState('');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Pago' | 'Pendente' | 'Atrasado'>('Pago');
  const [erro, setErro] = useState('');

  // Handle student selection and auto-prefetch their course configuration
  const handleSelecionarAluno = (selectedAlunoId: string) => {
    setAlunoId(selectedAlunoId);
    
    // Auto find the course of this student from active courses
    // Prefill the normal course fee
    const studentEnrollment = AlunoCursoAssociation(selectedAlunoId);
    if (studentEnrollment) {
      setValor(studentEnrollment.valorMensalidade.toString());
    }
  };

  // Helper: Find student course association details
  const AlunoCursoAssociation = (stdId: string): Curso | null => {
    // Usually, in mockData there is m1..m12 matriculas linking. Let's search student index or mock links
    // Since we don't have matriculas array directly as property here, we can infer by student's name/data or find in parent app
    // We can pass or infer. Let's do it simply by associating with user state. Wait, we can get associated course id 
    // by finding any existing payment of this student, or we can just let parents resolve. Let's look up our student's active matricula course
    const student = alunos.find(a => a.id === stdId);
    if (!student) return null;
    // We can search through courses
    const studentCourse = (window as any)._appMatriculas?.find((m: any) => m.alunoId === stdId);
    if (studentCourse) {
      const course = cursos.find(c => c.id === studentCourse.cursoId);
      return course || null;
    }
    // Fallback: search for first payment course id
    const pastPayment = pagamentos.find(p => p.alunoId === stdId);
    if (pastPayment) {
      const course = cursos.find(c => c.id === pastPayment.cursoId);
      return course || null;
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!alunoId || !valor || !dataPagamento) {
      setErro('Preencha os dados do recebimento financeiro.');
      return;
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('O valor deve ser maior do que zero.');
      return;
    }

    // Resolve course linked
    const linkedCourse = AlunoCursoAssociation(alunoId);
    const resolvedCursoId = linkedCourse ? linkedCourse.id : (cursos[0]?.id || 'c1');

    onAddPagamento({
      alunoId,
      cursoId: resolvedCursoId,
      valor: valorNum,
      dataPagamento,
      status
    });

    // Reset Form
    setAlunoId('');
    setValor('');
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setStatus('Pago');
    setErro('');
  };

  const getAlunoNome = (id: string) => {
    const student = alunos.find(a => a.id === id);
    return student ? student.nome : 'Aluno desconhecido';
  };

  const getCursoNome = (id: string) => {
    const curso = cursos.find(c => c.id === id);
    return curso ? curso.nome : 'Curso indefinido';
  };

  // Filter pagamentos
  const pagamentosFiltrados = pagamentos.filter(p => {
    const nomeAluno = getAlunoNome(p.alunoId).toLowerCase();
    const correspondeBusca = nomeAluno.includes(busca.toLowerCase());
    const correspondeCurso = cursoFiltro === 'Todos' || p.cursoId === cursoFiltro;
    const correspondeStatus = statusFiltro === 'Todos' || p.status === statusFiltro;

    return correspondeBusca && correspondeCurso && correspondeStatus;
  });

  // KPI Calculations inside payments
  const totalRecebido = pagamentos.filter(p => p.status === 'Pago').reduce((acc, c) => acc + c.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0);
  const totalAtrasado = pagamentos.filter(p => p.status === 'Atrasado').reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Lançamentos Financeiros (Mensalidades)</h2>
        <p className="text-slate-500 text-sm mt-1">Gere novos recebimentos ou modifique o status das pendências financeiras mensais.</p>
      </div>

      {/* Grid: Financial status summary inside payments tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-emerald-800/80 text-xs font-bold uppercase tracking-wider">Total Liquidado</span>
            <h4 className="text-2xl font-extrabold text-emerald-800 mt-0.5">{formatCurrency(totalRecebido)}</h4>
          </div>
          <span className="p-3 bg-emerald-500 text-white rounded-xl"><DollarSign className="w-5 h-5" /></span>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-amber-800/80 text-xs font-bold uppercase tracking-wider">Previsão Pendente</span>
            <h4 className="text-2xl font-extrabold text-amber-800 mt-0.5">{formatCurrency(totalPendente)}</h4>
          </div>
          <span className="p-3 bg-amber-500 text-white rounded-xl"><Calendar className="w-5 h-5" /></span>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-rose-800/80 text-xs font-bold uppercase tracking-wider">Inadimplência (Atrasado)</span>
            <h4 className="text-2xl font-extrabold text-rose-800 mt-0.5">{formatCurrency(totalAtrasado)}</h4>
          </div>
          <span className="p-3 bg-rose-500 text-white rounded-xl"><AlertCircle className="w-5 h-5" /></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Launch payment Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Lançar Recebimento Manual</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-lg font-medium">
                {erro}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selecionar Aluno *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></span>
                <select
                  value={alunoId}
                  onChange={(e) => handleSelecionarAluno(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecione o Aluno...</option>
                  {alunos.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor do Pagamento *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    className="w-full pl-9 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data Competência *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar className="w-4 h-4" /></span>
                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Legal</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('Pago')}
                  className={`py-1.5 px-2 border rounded-lg text-[11px] font-bold transition-all ${
                    status === 'Pago'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  Pago
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Pendente')}
                  className={`py-1.5 px-2 border rounded-lg text-[11px] font-bold transition-all ${
                    status === 'Pendente'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  Pendente
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Atrasado')}
                  className={`py-1.5 px-2 border rounded-lg text-[11px] font-bold transition-all ${
                    status === 'Atrasado'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  Atrasado
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Lançar Competência
            </button>
          </form>
        </div>

        {/* ledger list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900">Extrato de Mensalidades ({pagamentosFiltrados.length})</h3>
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* filter courses */}
              <select
                value={cursoFiltro}
                onChange={(e) => setCursoFiltro(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:outline-none"
              >
                <option value="Todos">Filtrar por Curso</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              {/* filter status */}
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:outline-none"
              >
                <option value="Todos">Status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>

              {/* search name */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-3.5 h-3.5" /></span>
                <input
                  type="text"
                  placeholder="Nome do aluno..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 filter w-36 transition-colors font-medium"
                />
              </div>

            </div>
          </div>

          {/* Table display */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-2">Aluno</th>
                  <th className="py-3 px-2">Curso Vinculado</th>
                  <th className="py-3 px-2 text-center">Data</th>
                  <th className="py-3 px-2 text-right">Valor Lançado</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Mudar Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {pagamentosFiltrados
                  .slice()
                  .reverse() // show latest entries first in payments ledger
                  .map((pag) => (
                    <tr key={pag.id} className="hover:bg-slate-50/60 text-sm transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-900">{getAlunoNome(pag.alunoId)}</td>
                      <td className="py-3 px-2 text-xs font-medium text-slate-500">{getCursoNome(pag.cursoId)}</td>
                      <td className="py-3 px-2 text-center text-xs text-slate-400">{pag.dataPagamento.split('-').reverse().join('/')}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">{formatCurrency(pag.valor)}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pag.status === 'Pago' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : pag.status === 'Pendente' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {pag.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          {pag.status !== 'Pago' && (
                            <button
                              onClick={() => onUpdateStatusPagamento(pag.id, 'Pago')}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Marcar como Pago"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <select
                            value={pag.status}
                            onChange={(e) => onUpdateStatusPagamento(pag.id, e.target.value as 'Pago' | 'Pendente' | 'Atrasado')}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-[11px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                          >
                            <option value="Pago">Pago</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Atrasado">Atrasado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}

                {pagamentosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      Nenhum registro de mensalidade financeira correspondente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
