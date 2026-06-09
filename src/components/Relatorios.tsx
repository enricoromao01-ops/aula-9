import { useState } from 'react';
import { Curso, Aluno, Pagamento, Matricula } from '../types';
import { calculateKpis, formatCurrency } from '../utils/kpiCalculator';
import { FileSpreadsheet, Printer, Filter, Calendar, Search, ArrowRight, Table } from 'lucide-react';

interface RelatoriosProps {
  cursos: Curso[];
  alunos: Aluno[];
  matriculas: Matricula[];
  pagamentos: Pagamento[];
}

export default function Relatorios({ cursos, alunos, matriculas, pagamentos }: RelatoriosProps) {
  // Filter states
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-12-31');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [cursoFiltro, setCursoFiltro] = useState('Todos');

  // Unique categories
  const categorias = ['Todas', ...Array.from(new Set(cursos.map(c => c.categoria)))];

  // Calculate Metrics based on filters set
  const {
    totalReceita,
    totalAlunosCount,
    totalAtivosCount,
    receitaPorAlunoGeral,
    receitaPorAlunoAtivoGeral,
    courseKpis,
    averageCourseKpi
  } = calculateKpis(cursos, alunos, matriculas, pagamentos, {
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    categoria: categoriaFiltro === 'Todas' ? undefined : categoriaFiltro,
    cursoId: cursoFiltro === 'Todos' ? undefined : cursoFiltro
  });

  // Export to Excel / CSV function
  const handleExportExcel = () => {
    // Generate lines
    let csvContent = '\uFEFF'; // Add UTF-8 Byte Order Mark (BOM) so Excel reads Portuguese accents correctly
    csvContent += 'Curso;Categoria;Mensalidade;Total Alunos;Total Alunos Ativos;Faturamento Total;Receita por Aluno;Situação de Rentabilidade\r\n';

    courseKpis.forEach(ck => {
      const row = [
        ck.cursoNome,
        ck.categoria,
        ck.mensalidade.toFixed(2).replace('.', ','),
        ck.totalAlunos,
        ck.totalAtivos,
        ck.receitaTotal.toFixed(2).replace('.', ','),
        ck.receitaPorAluno.toFixed(2).replace('.', ','),
        ck.desempenhoStatus
      ].join(';');
      csvContent += row + '\r\n';
    });

    // Add aggregate statistics underneath
    csvContent += '\r\n';
    csvContent += `Estatísticas Gerais do Período (${dataInicio.split('-').reverse().join('/')} até ${dataFim.split('-').reverse().join('/')})\r\n`;
    csvContent += `Receita Total do Período;${totalReceita.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `Total de Alunos Filtro;${totalAlunosCount}\r\n`;
    csvContent += `Receita Média por Aluno;${receitaPorAlunoGeral.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `Receita Média por Aluno Ativo;${receitaPorAlunoAtivoGeral.toFixed(2).replace('.', ',')}\r\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_receita_por_aluno_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF using standard browser print layout
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Relatórios Executivos e Exportações</h2>
          <p className="text-slate-500 text-sm mt-1">Gere demonstrativos, aplique filtros de competência por período e faça exportações oficiais.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha (Excel)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Exportar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Filter panel (no-print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 no-print">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtros Consolidados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Data Inicio */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Início Período
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fim Período
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Cursos */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Curso Individual</label>
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Todos">Todos os Cursos</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Print Container */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs print-card space-y-8">
        
        {/* Print Only Header (Visible on print) */}
        <div className="hidden print-only border-b border-slate-300 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">INSTITUIÇÃO EDUCACIONAL - AUDITORIA</h1>
              <p className="text-slate-500 text-xs">Relatório Consolidado de Rentabilidade de Cursos (KPI Receita por Aluno)</p>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              Emitido em: {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
            Filtros Ativos: Período de <span className="font-semibold">{dataInicio.split('-').reverse().join('/')}</span> até <span className="font-semibold">{dataFim.split('-').reverse().join('/')}</span> • Categoria: <span className="font-semibold">{categoriaFiltro}</span> • Curso: <span className="font-semibold">{cursoFiltro}</span>
          </div>
        </div>

        {/* Aggregate Mini Cards inside reports */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100 pb-6">
          <div className="p-4 bg-slate-50/50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Período Receita</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalReceita)}</div>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Alunos Matriculados</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{totalAlunosCount} <span className="text-xs text-slate-400 font-normal">alunos</span></div>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-xl border border-blue-100">
            <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Média Geral / Aluno</span>
            <div className="text-lg font-extrabold text-blue-800 mt-0.5">{formatCurrency(receitaPorAlunoGeral)}</div>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Média Geral / Ativo</span>
            <div className="text-lg font-extrabold text-slate-800 mt-0.5">{formatCurrency(receitaPorAlunoAtivoGeral)}</div>
          </div>
        </div>

        {/* Tabular data */}
        <div className="space-y-4">
          <div className="flex justify-between items-center no-print">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1"><Table className="w-4 h-4 text-slate-500" /> Detalhamento Analítico</h4>
            <span className="text-xs text-slate-400 font-mono">Total de linhas: {courseKpis.length}</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-2">Curso</th>
                  <th className="py-3 px-2">Categoria</th>
                  <th className="py-3 px-2 text-right">Mensalidade</th>
                  <th className="py-3 px-2 text-center">Alunos (Filtro)</th>
                  <th className="py-3 px-2 text-center">Alunos Ativos</th>
                  <th className="py-3 px-2 text-right">Receita Total</th>
                  <th className="py-3 px-2 text-right text-blue-600 bg-blue-50/20 font-extrabold">Receita / Aluno</th>
                  <th className="py-3 px-2 text-center">Situação KPI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
                {courseKpis.map((cursoKpi) => (
                  <tr key={cursoKpi.cursoId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-slate-900">{cursoKpi.cursoNome}</td>
                    <td className="py-3.5 px-2"><span className="px-2 py-0.5 font-medium text-xs bg-slate-100 rounded-full text-slate-500">{cursoKpi.categoria}</span></td>
                    <td className="py-3.5 px-2 text-right font-medium">{formatCurrency(cursoKpi.mensalidade)}</td>
                    <td className="py-3.5 px-2 text-center font-semibold text-slate-700">{cursoKpi.totalAlunos}</td>
                    <td className="py-3.5 px-2 text-center text-slate-500">{cursoKpi.totalAtivos}</td>
                    <td className="py-3.5 px-2 text-right font-medium text-slate-800">{formatCurrency(cursoKpi.receitaTotal)}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-blue-700 bg-blue-50/10">{formatCurrency(cursoKpi.receitaPorAluno)}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cursoKpi.desempenhoStatus === 'Acima da Média'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : cursoKpi.desempenhoStatus === 'Abaixo da Média'
                            ? 'bg-rose-50 text-rose-800 border border-rose-100'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {cursoKpi.desempenhoStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info (Print Only) */}
        <div className="hidden print-only text-center text-[10px] text-slate-400 mt-16 pt-4 border-t border-slate-200">
          Este é um documento de auditoria gerencial emitido de forma automatizada pelo sitema de Gestão de Receita por Aluno.
        </div>
      </div>
      
    </div>
  );
}
