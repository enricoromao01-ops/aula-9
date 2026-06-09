import { Curso, Aluno, Pagamento, Matricula } from '../types';

export interface CourseKpi {
  cursoId: string;
  cursoNome: string;
  categoria: string;
  mensalidade: number;
  totalAlunos: number;
  totalAtivos: number;
  receitaTotal: number;
  receitaPorAluno: number; // Receita Total / totalAlunos
  receitaPorAlunoAtivo: number; // Receita Total / totalAtivos
  desempenhoStatus: 'Acima da Média' | 'Abaixo da Média' | 'Na Média';
}

export interface MonthlyKpi {
  mesAno: string; // Ex: "Jan 2026"
  receitaTotal: number;
  totalAlunos: number;
  receitaPorAluno: number;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

const ACIMA_DA_MEDIA_THRESHOLD = 1.05; // 5% above grand mean
const ABAIXO_DA_MEDIA_THRESHOLD = 0.95; // 5% below grand mean

/**
 * Calculates financial metrics for courses and overall institution
 */
export function calculateKpis(
  cursos: Curso[],
  alunos: Aluno[],
  matriculas: Matricula[],
  pagamentos: Pagamento[],
  filtros?: {
    dataInicio?: string;
    dataFim?: string;
    categoria?: string;
    cursoId?: string;
  }
) {
  // 1. Filtered data
  let filteredPagamentos = [...pagamentos];
  let filteredAlunos = [...alunos];

  if (filtros) {
    if (filtros.dataInicio) {
      const start = parseDate(filtros.dataInicio);
      filteredPagamentos = filteredPagamentos.filter(p => parseDate(p.dataPagamento) >= start);
    }
    if (filtros.dataFim) {
      const end = parseDate(filtros.dataFim);
      filteredPagamentos = filteredPagamentos.filter(p => parseDate(p.dataPagamento) <= end);
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') {
      const cursoIdsInCat = cursos.filter(c => c.categoria === filtros.categoria).map(c => c.id);
      filteredPagamentos = filteredPagamentos.filter(p => cursoIdsInCat.includes(p.cursoId));
      // Filter list of matriculated students
      const studentIdsInCat = matriculas.filter(m => cursoIdsInCat.includes(m.cursoId)).map(m => m.alunoId);
      filteredAlunos = filteredAlunos.filter(a => studentIdsInCat.includes(a.id));
    }
    if (filtros.cursoId && filtros.cursoId !== 'Todos') {
      filteredPagamentos = filteredPagamentos.filter(p => p.cursoId === filtros.cursoId);
      const studentIdsInCurso = matriculas.filter(m => m.cursoId === filtros.cursoId).map(m => m.alunoId);
      filteredAlunos = filteredAlunos.filter(a => studentIdsInCurso.includes(a.id));
    }
  }

  // 2. Core institution totals
  const totalReceita = filteredPagamentos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalAlunosCount = filteredAlunos.length;
  const totalAtivosCount = filteredAlunos.filter(a => a.status === 'Ativo').length;

  const receitaPorAlunoGeral = totalAlunosCount > 0 ? (totalReceita / totalAlunosCount) : 0;
  const receitaPorAlunoAtivoGeral = totalAtivosCount > 0 ? (totalReceita / totalAtivosCount) : 0;

  // 3. Course-specific metrics
  const courseKpis: CourseKpi[] = cursos.map(curso => {
    // Alunos matriculados no curso
    const matriculadosIds = matriculas.filter(m => m.cursoId === curso.id).map(m => m.alunoId);
    
    // Alunos filtrados que estao no curso
    const alunosNoCurso = filteredAlunos.filter(a => matriculadosIds.includes(a.id));
    const totalAlunos = alunosNoCurso.length;
    const totalAtivos = alunosNoCurso.filter(a => a.status === 'Ativo').length;

    // Receita do curso no período filtrado
    const receitaTotal = filteredPagamentos
      .filter(p => p.cursoId === curso.id)
      .reduce((acc, curr) => acc + curr.valor, 0);

    const receitaPorAluno = totalAlunos > 0 ? receitaTotal / totalAlunos : 0;
    const receitaPorAlunoAtivo = totalAtivos > 0 ? receitaTotal / totalAtivos : 0;

    return {
      cursoId: curso.id,
      cursoNome: curso.nome,
      categoria: curso.categoria,
      mensalidade: curso.valorMensalidade,
      totalAlunos,
      totalAtivos,
      receitaTotal,
      receitaPorAluno,
      receitaPorAlunoAtivo,
      desempenhoStatus: 'Na Média' // Will set shortly
    };
  });

  // Calculate Average Course Revenue-per-Student to categorize status
  const validCoursesCount = courseKpis.filter(ck => ck.receitaPorAluno > 0).length;
  const totalCourseRevenuePerStudent = courseKpis.reduce((acc, curr) => acc + curr.receitaPorAluno, 0);
  const averageCourseKpi = validCoursesCount > 0 ? totalCourseRevenuePerStudent / validCoursesCount : 0;

  courseKpis.forEach(ck => {
    if (ck.receitaPorAluno === 0) {
      ck.desempenhoStatus = 'Na Média';
    } else if (ck.receitaPorAluno > averageCourseKpi * ACIMA_DA_MEDIA_THRESHOLD) {
      ck.desempenhoStatus = 'Acima da Média';
    } else if (ck.receitaPorAluno < averageCourseKpi * ABAIXO_DA_MEDIA_THRESHOLD) {
      ck.desempenhoStatus = 'Abaixo da Média';
    } else {
      ck.desempenhoStatus = 'Na Média';
    }
  });

  // 4. Monthly metrics progression
  // Group pagamentos by Month
  const monthlyMap: { [key: string]: { receita: number; alunos: Set<string> } } = {};

  // Initialize with last 6 months or extract dynamically
  const mesesAbreviados = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  filteredPagamentos.forEach(p => {
    const date = parseDate(p.dataPagamento);
    const mesStr = mesesAbreviados[date.getMonth()];
    const anoStr = date.getFullYear();
    const key = `${mesStr}/${anoStr}`;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap[sortKey]) {
      monthlyMap[sortKey] = { receita: 0, alunos: new Set() };
    }
    monthlyMap[sortKey].receita += p.valor;
    monthlyMap[sortKey].alunos.add(p.alunoId);
  });

  // Generate monthly values
  const sortedKeys = Object.keys(monthlyMap).sort();
  const monthlyKpis: MonthlyKpi[] = sortedKeys.map(sortKey => {
    const [ano, mes] = sortKey.split('-');
    const mesNum = parseInt(mes, 10) - 1;
    const label = `${mesesAbreviados[mesNum]} ${ano}`;
    const data = monthlyMap[sortKey];
    
    // Alunos matriculados e ativos ate este mes
    const maxDateStr = `${ano}-${mes}-31`;
    const alunosAtivosAteMes = filteredAlunos.filter(a => {
      return a.dataMatricula <= maxDateStr;
    }).length;

    const divisor = alunosAtivosAteMes || data.alunos.size || 1;

    return {
      mesAno: label,
      receitaTotal: data.receita,
      totalAlunos: divisor,
      receitaPorAluno: data.receita / divisor
    };
  });

  // 5. Intelligent warnings
  const alertas: Array<{
    id: string;
    tipo: 'aviso' | 'sucesso' | 'info';
    titulo: string;
    mensagem: string;
    acao?: string;
  }> = [];

  // Check if current month average is down relative to previous month
  if (monthlyKpis.length >= 2) {
    const ultimo = monthlyKpis[monthlyKpis.length - 1];
    const penultimo = monthlyKpis[monthlyKpis.length - 2];
    if (ultimo.receitaPorAluno < penultimo.receitaPorAluno) {
      const diff = penultimo.receitaPorAluno - ultimo.receitaPorAluno;
      alertas.push({
        id: 'alerta-queda',
        tipo: 'aviso',
        titulo: `Queda na Receita por Aluno (${ultimo.mesAno})`,
        mensagem: `Identificamos uma redução de R$ ${diff.toFixed(2)} no faturamento médio gerado por aluno em comparação ao mês anterior (${penultimo.mesAno}).`,
      });
    }
  }

  // Highlight courses below average
  courseKpis.forEach(ck => {
    if (ck.totalAlunos > 0 && ck.desempenhoStatus === 'Abaixo da Média') {
      alertas.push({
        id: `alerta-curso-abaixo-${ck.cursoId}`,
        tipo: 'aviso',
        titulo: `Curso abaixo da média: ${ck.cursoNome}`,
        mensagem: `O curso gera ${formatCurrency(ck.receitaPorAluno)} por aluno, o que está abaixo da média geral dos cursos ativos (${formatCurrency(averageCourseKpi)}). Considere revisar o valor ou incentivar a contratação de pacotes adicionais.`,
      });
    } else if (ck.totalAlunos > 0 && ck.receitaPorAluno > averageCourseKpi * 1.2) {
      alertas.push({
        id: `alerta-curso-alto-${ck.cursoId}`,
        tipo: 'sucesso',
        titulo: `Curso altamente lucrativo: ${ck.cursoNome}`,
        mensagem: `Excelente desempenho! Este curso gera ${formatCurrency(ck.receitaPorAluno)} por aluno, ultrapassando em mais de 20% a média geral de rentabilidade.`,
      });
    }
  });

  // Warning for courses with zero active students but classified as "Ativo"
  cursos.forEach(c => {
    if (c.status === 'Ativo') {
      const matriculasAtivas = matriculas.filter(m => m.cursoId === c.id && m.status === 'Ativo').length;
      if (matriculasAtivas === 0) {
        alertas.push({
          id: `alerta-curso-vazio-${c.id}`,
          tipo: 'info',
          titulo: `Curso Ativo sem Alunos: ${c.nome}`,
          mensagem: `O curso está cadastrado como ativo, mas não possui matrículas vigentes de alunos ativos.`,
        });
      }
    }
  });

  return {
    totalReceita,
    totalAlunosCount,
    totalAtivosCount,
    receitaPorAlunoGeral,
    receitaPorAlunoAtivoGeral,
    courseKpis,
    monthlyKpis,
    alertas,
    averageCourseKpi
  };
}
