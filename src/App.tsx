import { useState, useEffect } from 'react';
import { Curso, Aluno, Matricula, Pagamento } from './types';
import { 
  INITIAL_CURSOS, 
  INITIAL_ALUNOS, 
  INITIAL_MATRICULAS, 
  INITIAL_PAGAMENTOS 
} from './data/mockData';

// Component imports
import Dashboard from './components/Dashboard';
import Cursos from './components/Cursos';
import Alunos from './components/Alunos';
import Pagamentos from './components/Pagamentos';
import Relatorios from './components/Relatorios';
import AnaliseDiferencial from './components/AnaliseDiferencial';

// Icon imports
import { 
  LayoutDashboard, 
  GraduationCap, 
  FolderKanban, 
  DollarSign, 
  BarChart3, 
  TrendingUp,
  FileText
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load from local storage or fallback to mock seed data
  const [cursos, setCursos] = useState<Curso[]>(() => {
    const saved = localStorage.getItem('app_cursos');
    return saved ? JSON.parse(saved) : INITIAL_CURSOS;
  });

  const [alunos, setAlunos] = useState<Aluno[]>(() => {
    const saved = localStorage.getItem('app_alunos');
    return saved ? JSON.parse(saved) : INITIAL_ALUNOS;
  });

  const [matriculas, setMatriculas] = useState<Matricula[]>(() => {
    const saved = localStorage.getItem('app_matriculas');
    return saved ? JSON.parse(saved) : INITIAL_MATRICULAS;
  });

  const [pagamentos, setPagamentos] = useState<Pagamento[]>(() => {
    const saved = localStorage.getItem('app_pagamentos');
    return saved ? JSON.parse(saved) : INITIAL_PAGAMENTOS;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('app_cursos', JSON.stringify(cursos));
  }, [cursos]);

  useEffect(() => {
    localStorage.setItem('app_alunos', JSON.stringify(alunos));
  }, [alunos]);

  useEffect(() => {
    localStorage.setItem('app_matriculas', JSON.stringify(matriculas));
    // Expose matriculas to global window scope so Pagamentos.tsx can access easily
    (window as any)._appMatriculas = matriculas;
  }, [matriculas]);

  useEffect(() => {
    localStorage.setItem('app_pagamentos', JSON.stringify(pagamentos));
  }, [pagamentos]);

  // -- CRUDS Course Callbacks --
  const handleAddCurso = (novoCurso: Omit<Curso, 'id'>) => {
    const id = 'c_' + Date.now();
    setCursos([...cursos, { ...novoCurso, id }]);
  };

  const handleEditCurso = (cursoEditado: Curso) => {
    setCursos(cursos.map(c => c.id === cursoEditado.id ? cursoEditado : c));
  };

  const handleDeleteCurso = (id: string) => {
    setCursos(cursos.filter(c => c.id !== id));
    // Cascade delete matriculas & pagamentos related to this course
    setMatriculas(matriculas.filter(m => m.cursoId !== id));
    setPagamentos(pagamentos.filter(p => p.cursoId !== id));
  };

  // -- CRUDS Student Callbacks --
  const handleAddAluno = (novoAluno: Omit<Aluno, 'id'>, cursoId: string) => {
    const alunoId = 'a_' + Date.now();
    const matriculaId = 'm_' + Date.now();
    const pagId = 'p_' + Date.now();

    const createdAluno: Aluno = { ...novoAluno, id: alunoId };
    setAlunos([...alunos, createdAluno]);

    // Create Matricula
    const createdMatricula: Matricula = {
      id: matriculaId,
      alunoId,
      cursoId,
      dataInicio: novoAluno.dataMatricula,
      status: novoAluno.status
    };
    setMatriculas([...matriculas, createdMatricula]);

    // Get course detail to schedule immediate monthly billing
    const course = cursos.find(c => c.id === cursoId);
    if (course) {
      const createdPagamento: Pagamento = {
        id: pagId,
        alunoId,
        cursoId,
        valor: course.valorMensalidade,
        dataPagamento: novoAluno.dataMatricula,
        status: 'Pago' // default active payments
      };
      setPagamentos([...pagamentos, createdPagamento]);
    }
  };

  const handleEditAluno = (alunoEditado: Aluno, cursoId: string) => {
    setAlunos(alunos.map(a => a.id === alunoEditado.id ? alunoEditado : a));
    
    // Update or create corresponding Matricula
    const existingMatriculaIndex = matriculas.findIndex(m => m.alunoId === alunoEditado.id);
    if (existingMatriculaIndex >= 0) {
      const updatedMatriculas = [...matriculas];
      updatedMatriculas[existingMatriculaIndex] = {
        ...updatedMatriculas[existingMatriculaIndex],
        cursoId,
        status: alunoEditado.status
      };
      setMatriculas(updatedMatriculas);
    } else {
      const newM: Matricula = {
        id: 'm_' + Date.now(),
        alunoId: alunoEditado.id,
        cursoId,
        dataInicio: alunoEditado.dataMatricula,
        status: alunoEditado.status
      };
      setMatriculas([...matriculas, newM]);
    }
  };

  const handleDeleteAluno = (id: string) => {
    setAlunos(alunos.filter(a => a.id !== id));
    setMatriculas(matriculas.filter(m => m.alunoId !== id));
    setPagamentos(pagamentos.filter(p => p.alunoId !== id));
  };

  // -- Receipts / Pagamentos Callbacks --
  const handleAddPagamento = (novoPagamento: Omit<Pagamento, 'id'>) => {
    const id = 'p_' + Date.now();
    setPagamentos([...pagamentos, { ...novoPagamento, id }]);
  };

  const handleUpdateStatusPagamento = (id: string, status: 'Pago' | 'Pendente' | 'Atrasado') => {
    setPagamentos(pagamentos.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDeletePagamento = (id: string) => {
    setPagamentos(pagamentos.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Professional Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo branding */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase flex items-center gap-1">
                  EduMetrics <span className="text-blue-600 text-[9px] uppercase font-bold bg-blue-50 px-1 py-0.5 rounded-sm border border-blue-100">Pro</span>
                </h1>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Métricas de Rentabilidade</span>
              </div>
            </div>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex h-full items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'dashboard' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" /> Painel Geral
              </button>

              <button
                onClick={() => setActiveTab('analise')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'analise' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" /> Diferencial
              </button>

              <button
                onClick={() => setActiveTab('cursos')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'cursos' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <FolderKanban className="w-4 h-4 shrink-0" /> Cursos
              </button>

              <button
                onClick={() => setActiveTab('alunos')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'alunos' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" /> Alunos
              </button>

              <button
                onClick={() => setActiveTab('pagamentos')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'pagamentos' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0" /> Lançamentos
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`h-full px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'relatorios' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" /> Exportações
              </button>
            </nav>

            {/* Micro email / profile tag */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="bg-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2 border border-slate-200">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Modo Pro</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Sub Mobile Navigation buttons rail (no-print) */}
      <div className="flex md:hidden bg-white border-b border-slate-100 overflow-x-auto no-print px-4 py-2 gap-1 custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Painel
        </button>
        <button
          onClick={() => setActiveTab('analise')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'analise' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Diferencial
        </button>
        <button
          onClick={() => setActiveTab('cursos')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'cursos' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Cursos
        </button>
        <button
          onClick={() => setActiveTab('alunos')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'alunos' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Alunos
        </button>
        <button
          onClick={() => setActiveTab('pagamentos')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'pagamentos' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Lançamentos
        </button>
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`flex-none py-1.5 px-3 rounded-lg text-xs font-bold ${
            activeTab === 'relatorios' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
          }`}
        >
          Exportações
        </button>
      </div>

      {/* Main App Content Box Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            cursos={cursos} 
            alunos={alunos} 
            matriculas={matriculas} 
            pagamentos={pagamentos} 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'analise' && (
          <AnaliseDiferencial 
            cursos={cursos} 
            alunos={alunos} 
            matriculas={matriculas} 
            pagamentos={pagamentos} 
          />
        )}

        {activeTab === 'cursos' && (
          <Cursos 
            cursos={cursos} 
            onAddCurso={handleAddCurso} 
            onEditCurso={handleEditCurso} 
            onDeleteCurso={handleDeleteCurso}
          />
        )}

        {activeTab === 'alunos' && (
          <Alunos 
            alunos={alunos} 
            cursos={cursos} 
            matriculas={matriculas} 
            onAddAluno={handleAddAluno} 
            onEditAluno={handleEditAluno} 
            onDeleteAluno={handleDeleteAluno}
          />
        )}

        {activeTab === 'pagamentos' && (
          <Pagamentos 
            pagamentos={pagamentos} 
            alunos={alunos} 
            cursos={cursos} 
            onAddPagamento={handleAddPagamento} 
            onUpdateStatusPagamento={handleUpdateStatusPagamento} 
            onDeletePagamento={handleDeletePagamento}
          />
        )}

        {activeTab === 'relatorios' && (
          <Relatorios 
            cursos={cursos} 
            alunos={alunos} 
            matriculas={matriculas} 
            pagamentos={pagamentos} 
          />
        )}

      </main>

      {/* Bottom Info Bar styled exactly according to the Bento mockup */}
      <footer className="h-auto md:h-12 bg-slate-900 py-4 md:py-0 px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between shrink-0 text-slate-400 text-[10px] font-bold uppercase tracking-widest no-print mt-12 gap-2 text-center md:text-left">
        <p>© 2026 EDUMETRICS ANALYTICS ENGINE • RECEITA POR ALUNO</p>
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          <span>DATABASE: FIREBASE_CLOUD_PROD</span>
          <span>UPTIME: 99.98%</span>
          <span className="text-emerald-400">ENCRYPTED SSL L6</span>
        </div>
      </footer>

    </div>
  );
}
