import { useState, FormEvent } from 'react';
import { Aluno, Curso, Matricula } from '../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Mail, Phone, BookOpen, Calendar, Filter } from 'lucide-react';

interface AlunosProps {
  alunos: Aluno[];
  cursos: Curso[];
  matriculas: Matricula[];
  onAddAluno: (aluno: Omit<Aluno, 'id'>, cursoId: string) => void;
  onEditAluno: (aluno: Aluno, cursoId: string) => void;
  onDeleteAluno: (id: string) => void;
}

export default function Alunos({ alunos, cursos, matriculas, onAddAluno, onEditAluno, onDeleteAluno }: AlunosProps) {
  const [busca, setBusca] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  // Form State
  const [modoEdicao, setModoEdicao] = useState(false);
  const [alunoAEditar, setAlunoAEditar] = useState<Aluno | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [dataMatricula, setDataMatricula] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // Error States
  const [erro, setErro] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !telefone.trim() || !cursoId || !dataMatricula) {
      setErro('Por favor, preencha todos os campos corretamente para matricular o aluno.');
      return;
    }

    if (!email.includes('@')) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setErro('');

    if (modoEdicao && alunoAEditar) {
      onEditAluno({
        id: alunoAEditar.id,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        dataMatricula,
        status
      }, cursoId);
      setModoEdicao(false);
      setAlunoAEditar(null);
    } else {
      onAddAluno({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        dataMatricula,
        status
      }, cursoId);
    }

    resetForm();
  };

  const resetForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setCursoId('');
    setDataMatricula(new Date().toISOString().split('T')[0]);
    setStatus('Ativo');
    setModoEdicao(false);
    setAlunoAEditar(null);
    setErro('');
  };

  const iniciarEdicao = (aluno: Aluno) => {
    // Find course enrolled
    const matricula = matriculas.find(m => m.alunoId === aluno.id);
    const mCursoId = matricula ? matricula.cursoId : '';

    setModoEdicao(true);
    setAlunoAEditar(aluno);
    setNome(aluno.nome);
    setEmail(aluno.email);
    setTelefone(aluno.telefone);
    setCursoId(mCursoId);
    setDataMatricula(aluno.dataMatricula);
    setStatus(aluno.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get course name
  const getCursoNome = (alunoId: string) => {
    const matricula = matriculas.find(m => m.alunoId === alunoId);
    if (!matricula) return 'Sem matrícula';
    const curso = cursos.find(c => c.id === matricula.cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  };

  // Filter lists
  const alunosFiltrados = alunos.filter(a => {
    const correspondeBusca = 
      a.nome.toLowerCase().includes(busca.toLowerCase()) || 
      a.email.toLowerCase().includes(busca.toLowerCase());
    
    const matricula = matriculas.find(m => m.alunoId === a.id);
    const correspondeCurso = cursoFiltro === 'Todos' || (matricula && matricula.cursoId === cursoFiltro);
    const correspondeStatus = statusFiltro === 'Todos' || a.status === statusFiltro;

    return correspondeBusca && correspondeStatus && correspondeCurso;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Cadastro e Gestão de Alunos</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie a admissão de estudantes, matrículas nos cursos e controle do status de vínculo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            {modoEdicao ? 'Editar Cadastro de Aluno' : 'Matricular Novo Aluno'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-lg font-medium animate-shake">
                {erro}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome Completo *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Luísa Maria Souza"
                className="w-full px-3.5 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-mail de Contato *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-4 h-4" /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="luisa@email.com"
                  className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefone *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data Matrícula *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar className="w-4 h-4" /></span>
                  <input
                    type="date"
                    value={dataMatricula}
                    onChange={(e) => setDataMatricula(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Curso a Matricular *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><BookOpen className="w-4 h-4" /></span>
                <select
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecione o Curso...</option>
                  {cursos.filter(c => c.status === 'Ativo').map(c => (
                    <option key={c.id} value={c.id}>{c.nome} (R$ {c.valorMensalidade}/mês)</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status do Aluno</label>
              <div className="flex gap-4 mt-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('Ativo')}
                  className={`flex-1 py-1.5 px-3 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Ativo'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Ativo
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inativo')}
                  className={`flex-1 py-1.5 px-3 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Inativo'
                      ? 'bg-rose-50 border-red-500 text-red-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Inativo
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {modoEdicao ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                {modoEdicao ? 'Salvar Edição' : 'Matricular Aluno'}
              </button>

              {modoEdicao && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-lg text-xs font-bold py-2.5 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>

          </form>
        </div>

        {/* List Table Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900">Alunos Matriculados ({alunosFiltrados.length})</h3>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* Curso Switcher */}
              <select
                value={cursoFiltro}
                onChange={(e) => setCursoFiltro(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:outline-none"
              >
                <option value="Todos">Todos os Cursos</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              {/* Status Switcher */}
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:outline-none"
              >
                <option value="Todos">Todos Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              {/* Input */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-3.5 h-3.5" /></span>
                <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-44 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* List display */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-2">Aluno</th>
                  <th className="py-3 px-2">Contato</th>
                  <th className="py-3 px-2">Curso Matriculado</th>
                  <th className="py-3 px-2 text-center">Matrícula</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-1.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50/60 text-sm transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-slate-900">{aluno.nome}</div>
                    </td>
                    <td className="py-3 px-2 text-xs">
                      <div className="font-medium text-slate-500 flex items-center gap-1 mb-0.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {aluno.email}
                      </div>
                      <div className="font-medium text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {aluno.telefone}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-medium text-slate-700 bg-blue-50/80 text-blue-950 px-2.5 py-0.5 rounded-lg text-xs border border-blue-100/30">
                        {getCursoNome(aluno.id)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs font-medium text-slate-400">
                      {aluno.dataMatricula.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        aluno.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {aluno.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-1.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => iniciarEdicao(aluno)}
                          className="p-1 px-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar aluno"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir as informações de matrícula de "${aluno.nome}"?`)) {
                              onDeleteAluno(aluno.id);
                            }
                          }}
                          className="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir aluno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {alunosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      Nenhum aluno correspondente encontrado.
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
