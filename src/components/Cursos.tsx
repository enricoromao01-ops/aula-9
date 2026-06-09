import { useState, FormEvent } from 'react';
import { Curso } from '../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, DollarSign, Calendar, Tag, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/kpiCalculator';

interface CursosProps {
  cursos: Curso[];
  onAddCurso: (curso: Omit<Curso, 'id'>) => void;
  onEditCurso: (curso: Curso) => void;
  onDeleteCurso: (id: string) => void;
}

export default function Cursos({ cursos, onAddCurso, onEditCurso, onDeleteCurso }: CursosProps) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  
  // Form State
  const [modoEdicao, setModoEdicao] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState<Curso | null>(null);
  const [nome, setNome] = useState('');
  const [valorMensalidade, setValorMensalidade] = useState('');
  const [duracaoMeses, setDuracaoMeses] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  
  // Errors
  const [erro, setErro] = useState('');

  // Extract unique categories for filtering
  const categoriasUnicas = ['Todas', ...Array.from(new Set(cursos.map(c => c.categoria)))];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !valorMensalidade || !duracaoMeses || !categoria.trim()) {
      setErro('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const valorNum = parseFloat(valorMensalidade);
    const duracaoNum = parseInt(duracaoMeses, 10);

    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('O valor da mensalidade deve ser maior que zero.');
      return;
    }

    if (isNaN(duracaoNum) || duracaoNum <= 0) {
      setErro('A duração do curso deve ser de pelo menos 1 mês.');
      return;
    }

    setErro('');

    if (modoEdicao && cursoAEditar) {
      onEditCurso({
        id: cursoAEditar.id,
        nome: nome.trim(),
        valorMensalidade: valorNum,
        duracaoMeses: duracaoNum,
        categoria: categoria.trim(),
        status
      });
      setModoEdicao(false);
      setCursoAEditar(null);
    } else {
      onAddCurso({
        nome: nome.trim(),
        valorMensalidade: valorNum,
        duracaoMeses: duracaoNum,
        categoria: categoria.trim(),
        status
      });
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setNome('');
    setValorMensalidade('');
    setDuracaoMeses('');
    setCategoria('');
    setStatus('Ativo');
    setModoEdicao(false);
    setCursoAEditar(null);
    setErro('');
  };

  const iniciarEdicao = (indexCurso: Curso) => {
    setModoEdicao(true);
    setCursoAEditar(indexCurso);
    setNome(indexCurso.nome);
    setValorMensalidade(indexCurso.valorMensalidade.toString());
    setDuracaoMeses(indexCurso.duracaoMeses.toString());
    setCategoria(indexCurso.categoria);
    setStatus(indexCurso.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter list
  const cursosFiltrados = cursos.filter(c => {
    const correspondeBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || 
                              c.categoria.toLowerCase().includes(busca.toLowerCase());
    const correspondeCategoria = categoriaFiltro === 'Todas' || c.categoria === categoriaFiltro;
    return correspondeBusca && correspondeCategoria;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Cadastro e Gestão de Cursos</h2>
        <p className="text-slate-500 text-sm mt-1">Configure o portfólio de cursos, seus valores de parcelas e categorias correspondentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Container */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
            {modoEdicao ? 'Editar Informações do Curso' : 'Cadastrar Novo Curso'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-lg font-medium">
                {erro}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Curso *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Engenharia de Software"
                className="w-full px-3.5 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duração (Meses) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Calendar className="w-4 h-4" /></span>
                  <input
                    type="number"
                    value={duracaoMeses}
                    onChange={(e) => setDuracaoMeses(e.target.value)}
                    placeholder="12"
                    min="1"
                    className="w-full pl-10 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mensalidade (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(e.target.value)}
                    placeholder="250.00"
                    min="0.01"
                    className="w-full pl-9 pr-3 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria *</label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Tecnologia, Negócios, Saúde"
                className="w-full px-3.5 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Operacional</label>
              <div className="flex gap-4 mt-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('Ativo')}
                  className={`flex-1 py-2 px-3 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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
                  className={`flex-1 py-2 px-3 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Inativo'
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
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
                {modoEdicao ? 'Salvar Edição' : 'Cadastrar Curso'}
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

        {/* Courses Table/List View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 p-6 space-y-4">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900">Cursos Registrados ({cursosFiltrados.length})</h3>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:outline-none"
              >
                {categoriasUnicas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-3.5 h-3.5" /></span>
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 sm:w-48 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* List display */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-2">Curso</th>
                  <th className="py-3 px-2">Categoria</th>
                  <th className="py-3 px-2 text-center">Duração</th>
                  <th className="py-3 px-2 text-right">Mensalidade</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cursosFiltrados.map((curso) => (
                  <tr key={curso.id} className="hover:bg-slate-50/60 text-sm transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-slate-900">{curso.nome}</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <Tag className="w-2.5 h-2.5" />
                        {curso.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-500 font-medium">{curso.duracaoMeses} m</td>
                    <td className="py-3.5 px-2 text-right font-semibold text-blue-600">{formatCurrency(curso.valorMensalidade)}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        curso.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {curso.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => iniciarEdicao(curso)}
                          className="p-1 px-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar curso"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza de que deseja excluir o curso "${curso.nome}"? A exclusão removerá o curso da listagem comercial.`)) {
                              onDeleteCurso(curso.id);
                            }
                          }}
                          className="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir curso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {cursosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      Nenhum curso correspondente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 text-xs text-blue-900 mt-4">
            <Layers className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-bold">Orientação de KPI:</span> As mensalidades configuradas neste cadastro compõem a receita futura prevista quando matriculadas para os alunos na aba correspondente.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
