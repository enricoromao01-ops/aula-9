import { useState } from 'react';
import { Curso, Aluno, Pagamento, Matricula } from '../types';
import { calculateKpis, formatCurrency } from '../utils/kpiCalculator';
import { 
  Compass, 
  Lightbulb, 
  TrendingUp, 
  AlertOctagon, 
  Target, 
  Sliders, 
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';

interface AnaliseDiferencialProps {
  cursos: Curso[];
  alunos: Aluno[];
  matriculas: Matricula[];
  pagamentos: Pagamento[];
}

export default function AnaliseDiferencial({ cursos, alunos, matriculas, pagamentos }: AnaliseDiferencialProps) {
  const { courseKpis, averageCourseKpi } = calculateKpis(cursos, alunos, matriculas, pagamentos);

  // Simulation parameters states
  const [cursoSimuladoId, setCursoSimuladoId] = useState(cursos[0]?.id || '');
  const [ajusteValor, setAjusteValor] = useState(25); // increment price simulation
  const [adicaoAlunos, setAdicaoAlunos] = useState(5); // increase students simulation

  // Find course to simulate
  const cursoSelecionadoObj = cursos.find(c => c.id === cursoSimuladoId);
  const kpiDoSelecionado = courseKpis.find(ck => ck.cursoId === cursoSimuladoId);

  // Run simulation metrics
  const simMatriculasCount = kpiDoSelecionado ? kpiDoSelecionado.totalAlunos : 0;
  const simReceitaAtual = kpiDoSelecionado ? kpiDoSelecionado.receitaTotal : 0;
  const simMensalidadeAtual = cursoSelecionadoObj ? cursoSelecionadoObj.valorMensalidade : 0;

  // New simulated variables
  const simNovaMensalidade = simMensalidadeAtual + ajusteValor;
  const simNovosAlunos = simMatriculasCount + adicaoAlunos;
  // Estimated projected monthly revenue
  const simMensalProjetadoAtual = simMatriculasCount * simMensalidadeAtual;
  const simMensalProjetadoNovo = simNovosAlunos * simNovaMensalidade;
  const diferencaProjetada = simMensalProjetadoNovo - simMensalProjetadoAtual;

  const simNovoKpiPorAluno = simNovosAlunos > 0 ? (simMensalProjetadoNovo * (kpiDoSelecionado?.mensalidade ? (kpiDoSelecionado.receitaTotal / (kpiDoSelecionado.totalAlunos * kpiDoSelecionado.mensalidade || 1)) : 1)) / simNovosAlunos : 0;

  // Prepare chart datasets comparing Absolute Revenue vs. KPI Revenue/Student
  const sortedByAbsolute = [...courseKpis]
    .filter(ck => ck.totalAlunos > 0)
    .sort((a, b) => b.receitaTotal - a.receitaTotal);

  const sortedByKpi = [...courseKpis]
    .filter(ck => ck.totalAlunos > 0)
    .sort((a, b) => b.receitaPorAluno - a.receitaPorAluno);

  // Dynamic analysis comments
  const cursoMaiorAbsoluto = sortedByAbsolute[0]?.cursoNome || 'Nenhum';
  const faturamentoMaiorAbsoluto = sortedByAbsolute[0]?.receitaTotal || 0;

  const cursoMaiorKpi = sortedByKpi[0]?.cursoNome || 'Nenhum';
  const maiorKpiValor = sortedByKpi[0]?.receitaPorAluno || 0;

  const temDescompasso = sortedByAbsolute[0]?.cursoId !== sortedByKpi[0]?.cursoId;

  // Colors for charts
  const BLUE_GREEN_COLORS = ['#3b82f6', '#10b981', '#0ea5e9', '#059669', '#2563eb', '#14b8a6'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Espaço de Análise Diferencial e Alavancagem</h2>
        <p className="text-slate-500 text-sm mt-1">
          Identifique quais cursos possuem verdadeira eficiência financeira por aluno, prevenindo que disparidades de escala mascarem canais críticos de margem.
        </p>
      </div>

      {/* Explanatory banner: Absolute vs Per Student */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl relative overflow-hidden shadow-md">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-4 h-4" /> Diagnóstico Financeiro Avançado
            </span>
            <h4 className="text-lg font-bold">A Armadilha do Volume Absoluto</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Muitos gestores celebram o curso com o maior faturamento bruto total, porém esse curso pode demandar enorme número de alunos, sobrecarregando o suporte técnico, docentes e custos fixos. 
              Ao focar no indicador <strong className="text-white font-semibold">Receita por Aluno (Receita ÷ Alunos)</strong>, revelamos sua real margem contributiva unitária. Assim, você planeja quais ofertas devem ser replicadas e quais exigem reajuste.
            </p>
          </div>
          <div className="lg:col-span-4 bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-center space-y-2 font-mono">
            <div className="text-xs text-slate-300">Status da Operação:</div>
            {temDescompasso ? (
              <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" /> Descompasso de KPI Ativo
              </div>
            ) : (
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Concordância de KPI
              </div>
            )}
            <div className="text-[11px] text-slate-400 leading-tight">
              {temDescompasso 
                ? `Seu curso campeão absoluto é "${cursoMaiorAbsoluto}", mas o curso que mais gera receita média real por ALUNO é "${cursoMaiorKpi}". O volume está mascarando as margens!`
                : `Seu campeão absoluto de faturamento coincide com o de melhor rentabilidade por aluno. Excelente alinhamento!`}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Comparison side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart A: Absolute Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Métrica Tradicional</span>
            <h4 className="text-base font-bold text-slate-900">1. Faturamento Absoluto por Curso</h4>
            <p className="text-slate-400 text-xs mt-0.5">Soma acumulada de todos os recebimentos já liquidados.</p>
          </div>
          <div className="h-64">
            {sortedByAbsolute.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByAbsolute} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="cursoNome" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(name) => name.length > 12 ? name.substring(0, 10) + '...' : name}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `R$ ${val}`} tickLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receitaTotal" radius={[4, 4, 0, 0]}>
                    {sortedByAbsolute.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Registre transações.</div>
            )}
          </div>
        </div>

        {/* Chart B: Receita por Aluno (KPI) */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm ring-2 ring-blue-600/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-500 uppercase font-extrabold tracking-wider">Indicador de Eficiência</span>
              <h4 className="text-base font-extrabold text-blue-900">2. Receita Única por Aluno</h4>
              <p className="text-blue-700/60 text-xs mt-0.5">Média unitária gerada por aluno (Fórmula KPI).</p>
            </div>
            <span className="px-2 py-0.5 bg-blue-100/60 text-[10px] font-mono text-blue-800 rounded font-bold">Média: {formatCurrency(averageCourseKpi)}</span>
          </div>
          <div className="h-64">
            {sortedByKpi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByKpi} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="cursoNome" 
                    stroke="#2563eb" 
                    fontSize={10} 
                    tickFormatter={(name) => name.length > 12 ? name.substring(0, 10) + '...' : name}
                    tickLine={false}
                  />
                  <YAxis stroke="#2563eb" fontSize={10} tickFormatter={(val) => `R$ ${val}`} tickLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receitaPorAluno" radius={[4, 4, 0, 0]}>
                    {sortedByKpi.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.receitaPorAluno >= averageCourseKpi ? '#10b981' : '#f43f5e'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Registre matrículas.</div>
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Simulation space */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 mb-6 font-sans">
          <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><Sliders className="w-5 h-5" /></span>
          <div>
            <h4 className="text-base font-bold text-slate-900">Simulador de Alavancagem e Impacto</h4>
            <p className="text-slate-400 text-xs">Simule o impacto de reajustar valores e expandir alunos na eficiência e faturamento do curso.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls simulation */}
          <div className="space-y-4 lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-8">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">1. Escolher Curso:</label>
              <select
                value={cursoSimuladoId}
                onChange={(e) => setCursoSimuladoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Slider 1: increment fee */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">2. Ajuste Mensalidade (R$):</label>
                <span className="text-xs font-bold text-blue-600">+{formatCurrency(ajusteValor)}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="200"
                step="5"
                value={ajusteValor}
                onChange={(e) => setAjusteValor(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 leading-tight">
                <span>Desconto R$-100</span>
                <span>Acréscimo R$+200</span>
              </div>
            </div>

            {/* Slider 2: Add students */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">3. Adicionar Alunos:</label>
                <span className="text-xs font-bold text-emerald-600">+{adicaoAlunos} novos</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={adicaoAlunos}
                onChange={(e) => setAdicaoAlunos(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>+1 aluno</span>
                <span>+30 alunos</span>
              </div>
            </div>
          </div>

          {/* Results indicators of simulation */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-40">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Métrica de Eficiência Estimada</span>
                <h5 className="text-xs text-slate-600 font-bold mt-1">Nova Mensalidade do Curso</h5>
                <p className="text-2xl font-extrabold text-blue-950 mt-2">
                  {formatCurrency(simNovaMensalidade)}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Mensalidade original de {formatCurrency(simMensalidadeAtual)}
              </p>
            </div>

            <div className="bg-blue-50/20 p-5 rounded-2xl border border-blue-200/60 shadow-xs flex flex-col justify-between h-40">
              <div>
                <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Resultado da Alavancagem</span>
                <h5 className="text-xs text-blue-950 font-bold mt-1">Incremento Mensal de Receita</h5>
                <p className="text-2xl font-extrabold text-emerald-700 mt-2 animate-pulse">
                  +{formatCurrency(diferencaProjetada)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" /> Previsão total de {formatCurrency(simMensalProjetadoNovo)}/mês
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
