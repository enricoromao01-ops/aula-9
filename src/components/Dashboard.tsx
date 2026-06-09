import { useState } from 'react';
import { Curso, Aluno, Pagamento, Matricula } from '../types';
import { calculateKpis, formatCurrency } from '../utils/kpiCalculator';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowUpRight, 
  ChevronRight,
  BookOpen,
  Calculator
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
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardProps {
  cursos: Curso[];
  alunos: Aluno[];
  matriculas: Matricula[];
  pagamentos: Pagamento[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ cursos, alunos, matriculas, pagamentos, onNavigate }: DashboardProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  
  // Extract all categories
  const asCategories = Array.from(new Set(cursos.map(c => c.categoria)));
  const categorias = ['Todas', ...asCategories];

  // Calculate Metrics
  const {
    totalReceita,
    totalAlunosCount,
    totalAtivosCount,
    receitaPorAlunoGeral,
    receitaPorAlunoAtivoGeral,
    courseKpis,
    monthlyKpis,
    alertas,
    averageCourseKpi
  } = calculateKpis(cursos, alunos, matriculas, pagamentos, {
    categoria: categoriaFiltro === 'Todas' ? undefined : categoriaFiltro
  });

  // Colors for charts
  const BLUE_GREEN_COLORS = [
    '#2563eb', // Blue-600
    '#10b981', // Emerald-500
    '#0ea5e9', // Sky-500
    '#059669', // Emerald-600
    '#3b82f6', // Blue-500
    '#14b8a6', // Teal-500
    '#1d4ed8', // Blue-700
    '#047857', // Emerald-700
  ];

  // Data for course comparison (sorted by revenue per student)
  const chartCourseData = courseKpis
    .filter(ck => ck.totalAlunos > 0)
    .map(ck => ({
      name: ck.cursoNome.length > 20 ? ck.cursoNome.substring(0, 18) + '...' : ck.cursoNome,
      'Receita Individual': ck.receitaTotal,
      'Receita por Aluno': ck.receitaPorAluno,
      'Faturamento Total': ck.receitaTotal
    }))
    .sort((a, b) => b['Receita por Aluno'] - a['Receita por Aluno']);

  // Data for Course Revenue breakdown (Pie chart)
  const pieData = courseKpis
    .filter(ck => ck.receitaTotal > 0)
    .map(ck => ({
      name: ck.cursoNome,
      value: ck.receitaTotal
    }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header section with category filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Seu Dashboard Executivo</h2>
          <p className="text-slate-500 text-sm mt-1">Análise da saúde financeira com destaque ao rendimento por Aluno matriculado.</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtrar Categoria:</label>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs font-medium"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Receita Total */}
        <div id="kpi-receita-total" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full hover:border-slate-300">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receita Acumulada</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
              {formatCurrency(totalReceita)}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="font-semibold text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-lg text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.4%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Semestre anterior</span>
          </div>
        </div>

        {/* KPI: Total de Alunos */}
        <div id="kpi-total-alunos" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full hover:border-slate-300">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Alunos</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
              {totalAlunosCount} <span className="text-xs text-slate-400 font-normal">Cadastrados</span>
            </h3>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">
              {totalAtivosCount} Ativos
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Estável</span>
          </div>
        </div>

        {/* KPI: Receita por Aluno Geral (Prime Metric in gorgeous Bento block!) */}
        <div id="kpi-receita-aluno-geral" className="bg-blue-900 border border-blue-800 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all h-full lg:col-span-2">
          {/* Decorative BG Graphic */}
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 transition-transform group-hover:scale-110 duration-500">
            <TrendingUp className="w-40 h-40" />
          </div>
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Receita Média por Aluno (LTV)</p>
              <h2 className="text-3xl font-black text-white tracking-tighter mt-1">
                {formatCurrency(receitaPorAlunoGeral)}
              </h2>
              <p className="text-xs text-blue-200 mt-1.5 italic">Fórmula KPI: Receita total / alunos totais</p>
            </div>
            
            <div className="bg-blue-600 px-3 py-1.5 rounded-xl border border-blue-500 z-10 shrink-0 text-center shadow-sm">
              <div className="text-[9px] text-blue-100 uppercase font-bold tracking-wider">Meta Estável</div>
              <div className="text-white font-black text-sm">R$ 400,00</div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-blue-800">
            <span className="text-xs text-blue-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Toque para Análise Diferencial
            </span>
            <button 
              onClick={() => onNavigate('analise')}
              className="text-xs font-bold text-white bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg border border-blue-700 transition-colors cursor-pointer"
            >
              Simular Alavancagem →
            </button>
          </div>
        </div>

      </div>

      {/* Formula & Explanatory Box */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 text-white/5 pointer-events-none">
          <Calculator className="w-72 h-72" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Como calculamos este KPI?
            </h4>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Diferente de analisar apenas o faturamento absoluto (que cresce isoladamente com maior número de matrículas), o indicador **Receita por Aluno** aponta a eficiência da sua precificação e a profundidade de faturamento que você extrai de cada usuário.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex flex-col items-center justify-center text-center self-start lg:self-center font-mono">
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Fórmula Financeira</span>
            <span className="text-xl font-bold mt-1 tracking-wide">Receita por Aluno =</span>
            <span className="text-lg font-extrabold text-emerald-300 mt-0.5 border-t border-white/20 pt-1 px-4">
              Receita Total ÷ Alunos Cadastrados
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Evolução Mensal (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">Evolução Mensal do KPI</h4>
              <p className="text-slate-400 text-xs">Acompanhamento do ticket médio e receita geral por mês.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 block"></span> Receita</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 block"></span> Rec. por Aluno</span>
            </div>
          </div>
          <div className="h-80">
            {monthlyKpis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyKpis} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mesAno" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#2563eb" fontSize={11} tickFormatter={(val) => `R$${val}`} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickFormatter={(val) => `R$${val}`} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === 'Receita Total') return [formatCurrency(Number(value)), 'Faturamento'];
                      return [formatCurrency(Number(value)), 'Ticket Médio'];
                    }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="receitaTotal" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4 }} name="Receita Total" />
                  <Line yAxisId="right" type="monotone" dataKey="receitaPorAluno" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Receita por Aluno" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem dados suficientes para gerar histórico.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Participação da Receita por Curso (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">Participação no Faturamento</h4>
              <p className="text-slate-400 text-xs">Divisão percentual do faturamento total por curso.</p>
            </div>
          </div>
          <div className="h-60 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BLUE_GREEN_COLORS[index % BLUE_GREEN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">Sem dados de faturamento.</div>
            )}
          </div>
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[140px] custom-scrollbar">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: BLUE_GREEN_COLORS[idx % BLUE_GREEN_COLORS.length] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
                <span className="font-semibold shrink-0">
                  {((entry.value / totalReceita) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Alerts & Profitable Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Alerts Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              Alertas Inteligentes do KPI
            </h4>
            <span className="text-xs text-slate-400 font-mono">Dedução em tempo de execução</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
            {alertas.length > 0 ? (
              alertas.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className={`p-4 rounded-xl border flex gap-3 text-sm transition-all duration-150 ${
                    alerta.tipo === 'aviso' 
                      ? 'bg-amber-50/60 border-amber-200 border-l-4 border-l-amber-400 text-amber-900' 
                      : alerta.tipo === 'sucesso' 
                        ? 'bg-emerald-50/60 border-emerald-200 border-l-4 border-l-emerald-400 text-emerald-900'
                        : 'bg-blue-50/60 border-blue-200 border-l-4 border-l-blue-400 text-blue-900'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {alerta.tipo === 'aviso' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {alerta.tipo === 'sucesso' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {alerta.tipo === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider">{alerta.titulo}</h5>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{alerta.mensagem}</p>
                    {alerta.tipo === 'aviso' && (
                      <button 
                        onClick={() => onNavigate('analise')}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 underline mt-2 flex items-center gap-1"
                      >
                        Ver análise detalhada <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                Nenhum sinal crítico identificado. Sua operação está otimizada!
              </div>
            )}
          </div>
        </div>

        {/* Course performance ranking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h4 className="text-base font-bold text-slate-900">Ranking KPI (Líderes)</h4>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm font-mono">Rentabilidade</span>
            </div>
            
            <div className="space-y-4">
              {courseKpis
                .filter(ck => ck.totalAlunos > 0)
                .sort((a, b) => b.receitaPorAluno - a.receitaPorAluno)
                .slice(0, 4)
                .map((curso, idx) => (
                  <div key={curso.cursoId} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{curso.cursoNome}</h5>
                      <span className="text-[10px] text-slate-400">{curso.categoria} • {curso.totalAlunos} alunos</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-blue-600">{formatCurrency(curso.receitaPorAluno)}</div>
                      <div className="text-[9px] text-slate-400 font-medium">por aluno</div>
                    </div>
                  </div>
                ))}

              {courseKpis.filter(ck => ck.totalAlunos > 0).length === 0 && (
                <div className="text-slate-400 text-center py-6 text-sm">Registre matrículas para pontuar o ranking.</div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('analise')}
            className="w-full mt-6 py-2.5 bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 text-slate-600 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            Abrir Espaço de Análise Diferencial <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Grid comparing courses Absolute vs. KPI (Diferencial highlighting) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 py-1.5 px-3 bg-emerald-600 font-bold text-[10px] uppercase rounded-bl-xl tracking-wider">
          Familiarizesi com o Contexto
        </div>
        <div className="max-w-2xl">
          <h4 className="text-lg font-bold">Por que o indicador Receita por Aluno previne ilusões?</h4>
          <p className="text-slate-300 text-xs leading-relaxed mt-2">
            Um curso com faturamento total de R$ 10.000 pode parecer superior a um de R$ 3.000. Porém, se o primeiro possui 100 alunos (R$ 100 por aluno) e o segundo possui 5 alunos (R$ 600 por aluno), o segundo consome infinitamente menos suporte, infraestrutura e custos operacionais por real faturado.
          </p>
          <div className="mt-4 flex gap-4">
            <button 
              onClick={() => onNavigate('analise')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all duration-150"
            >
              Fazer Comparativo Visual Diferencial
            </button>
            <button 
              onClick={() => onNavigate('cursos')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all duration-150"
            >
              Gerenciar Valores de Mensalidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
