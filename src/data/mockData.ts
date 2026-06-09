import { Curso, Aluno, Matricula, Pagamento } from '../types';

export const INITIAL_CURSOS: Curso[] = [
  {
    id: 'c1',
    nome: 'Desenvolvimento Web Fullstack',
    valorMensalidade: 350,
    duracaoMeses: 12,
    categoria: 'Tecnologia',
    status: 'Ativo'
  },
  {
    id: 'c2',
    nome: 'UX/UI Design de Interfaces',
    valorMensalidade: 280,
    duracaoMeses: 6,
    categoria: 'Design',
    status: 'Ativo'
  },
  {
    id: 'c3',
    nome: 'Marketing Digital e Growth',
    valorMensalidade: 190,
    duracaoMeses: 4,
    categoria: 'Negócios',
    status: 'Ativo'
  },
  {
    id: 'c4',
    nome: 'Inglês para Negócios',
    valorMensalidade: 220,
    duracaoMeses: 8,
    categoria: 'Idiomas',
    status: 'Ativo'
  },
  {
    id: 'c5',
    nome: 'Gestão de Projetos Ágeis',
    valorMensalidade: 310,
    duracaoMeses: 3,
    categoria: 'Gestão',
    status: 'Ativo'
  },
  {
    id: 'c6',
    nome: 'Data Science e Analytics',
    valorMensalidade: 450,
    duracaoMeses: 10,
    categoria: 'Tecnologia',
    status: 'Ativo'
  }
];

export const INITIAL_ALUNOS: Aluno[] = [
  {
    id: 'a1',
    nome: 'Ana Luiza Santos',
    email: 'ana.santos@email.com',
    telefone: '(11) 98765-4321',
    dataMatricula: '2026-01-10',
    status: 'Ativo'
  },
  {
    id: 'a2',
    nome: 'Bruno Carvalho Ramos',
    email: 'bruno.ramos@email.com',
    telefone: '(21) 97654-3210',
    dataMatricula: '2026-01-15',
    status: 'Ativo'
  },
  {
    id: 'a3',
    nome: 'Camila Ferreira Costa',
    email: 'camila.costa@email.com',
    telefone: '(31) 96543-2109',
    dataMatricula: '2026-02-05',
    status: 'Ativo'
  },
  {
    id: 'a4',
    nome: 'Daniel Mello Rezende',
    email: 'daniel.mello@email.com',
    telefone: '(11) 95432-1098',
    dataMatricula: '2026-02-18',
    status: 'Ativo'
  },
  {
    id: 'a5',
    nome: 'Eduarda Vasconcelos',
    email: 'eduarda.v@email.com',
    telefone: '(41) 94321-0987',
    dataMatricula: '2026-03-01',
    status: 'Ativo'
  },
  {
    id: 'a6',
    nome: 'Felipe Almeida Melo',
    email: 'felipe.melo@email.com',
    telefone: '(81) 93210-9876',
    dataMatricula: '2026-03-12',
    status: 'Ativo'
  },
  {
    id: 'a7',
    nome: 'Gabriela Lima Flores',
    email: 'gabriela.f@email.com',
    telefone: '(11) 92109-8765',
    dataMatricula: '2026-04-02',
    status: 'Ativo'
  },
  {
    id: 'a8',
    nome: 'Hugo Silveira Neto',
    email: 'hugo.silveira@email.com',
    telefone: '(19) 91098-7654',
    dataMatricula: '2026-04-10',
    status: 'Ativo'
  },
  {
    id: 'a9',
    nome: 'Isabela Ribeiro Souza',
    email: 'isabela.r@email.com',
    telefone: '(31) 90987-6543',
    dataMatricula: '2026-05-01',
    status: 'Ativo'
  },
  {
    id: 'a10',
    nome: 'João Lucas Mendes',
    email: 'joao.mendes@email.com',
    telefone: '(21) 99876-5432',
    dataMatricula: '2026-05-15',
    status: 'Ativo'
  },
  {
    id: 'a11',
    nome: 'Larissa Rocha Neves',
    email: 'larissa.rocha@email.com',
    telefone: '(11) 98765-1122',
    dataMatricula: '2026-06-01',
    status: 'Ativo'
  },
  {
    id: 'a12',
    nome: 'Mateus Oliveira Prado',
    email: 'mateus.prado@email.com',
    telefone: '(11) 98765-2233',
    dataMatricula: '2026-06-05',
    status: 'Inativo' // To show some variation!
  }
];

export const INITIAL_MATRICULAS: Matricula[] = [
  { id: 'm1', alunoId: 'a1', cursoId: 'c1', dataInicio: '2026-01-10', status: 'Ativo' },
  { id: 'm2', alunoId: 'a2', cursoId: 'c1', dataInicio: '2026-01-15', status: 'Ativo' },
  { id: 'm3', alunoId: 'a3', cursoId: 'c2', dataInicio: '2026-02-05', status: 'Ativo' },
  { id: 'm4', alunoId: 'a4', cursoId: 'c3', dataInicio: '2026-02-18', status: 'Ativo' },
  { id: 'm5', alunoId: 'a5', cursoId: 'c4', dataInicio: '2026-03-01', status: 'Ativo' },
  { id: 'm6', alunoId: 'a6', cursoId: 'c5', dataInicio: '2026-03-12', status: 'Ativo' },
  { id: 'm7', alunoId: 'a7', cursoId: 'c6', dataInicio: '2026-04-02', status: 'Ativo' },
  { id: 'm8', alunoId: 'a8', cursoId: 'c2', dataInicio: '2026-04-10', status: 'Ativo' },
  { id: 'm9', alunoId: 'a9', cursoId: 'c1', dataInicio: '2026-05-01', status: 'Ativo' },
  { id: 'm10', alunoId: 'a10', cursoId: 'c6', dataInicio: '2026-05-15', status: 'Ativo' },
  { id: 'm11', alunoId: 'a11', cursoId: 'c4', dataInicio: '2026-06-01', status: 'Ativo' },
  { id: 'm12', alunoId: 'a12', cursoId: 'c3', dataInicio: '2026-06-05', status: 'Ativo' }
];

// Let's generate nice billing history from Jan to June 2026
export const INITIAL_PAGAMENTOS: Pagamento[] = [
  // January 2026
  { id: 'p1', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-01-10', status: 'Pago' },
  { id: 'p2', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-01-15', status: 'Pago' },

  // February 2026
  { id: 'p3', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-02-10', status: 'Pago' },
  { id: 'p4', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-02-15', status: 'Pago' },
  { id: 'p5', alunoId: 'a3', cursoId: 'c2', valor: 280, dataPagamento: '2026-02-05', status: 'Pago' },
  { id: 'p6', alunoId: 'a4', cursoId: 'c3', valor: 190, dataPagamento: '2026-02-18', status: 'Pago' },

  // March 2026
  { id: 'p7', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-03-10', status: 'Pago' },
  { id: 'p8', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-03-15', status: 'Pago' },
  { id: 'p9', alunoId: 'a3', cursoId: 'c2', valor: 280, dataPagamento: '2026-03-05', status: 'Pago' },
  { id: 'p10', alunoId: 'a4', cursoId: 'c3', valor: 190, dataPagamento: '2026-03-18', status: 'Pago' },
  { id: 'p11', alunoId: 'a5', cursoId: 'c4', valor: 220, dataPagamento: '2026-03-01', status: 'Pago' },
  { id: 'p12', alunoId: 'a6', cursoId: 'c5', valor: 310, dataPagamento: '2026-03-12', status: 'Pago' },

  // April 2026
  { id: 'p13', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-04-10', status: 'Pago' },
  { id: 'p14', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-04-15', status: 'Pago' },
  { id: 'p15', alunoId: 'a3', cursoId: 'c2', valor: 280, dataPagamento: '2026-04-05', status: 'Pago' },
  { id: 'p16', alunoId: 'a4', cursoId: 'c3', valor: 190, dataPagamento: '2026-04-18', status: 'Pago' },
  { id: 'p17', alunoId: 'a5', cursoId: 'c4', valor: 220, dataPagamento: '2026-04-01', status: 'Pago' },
  { id: 'p18', alunoId: 'a6', cursoId: 'c5', valor: 310, dataPagamento: '2026-04-12', status: 'Pago' },
  { id: 'p19', alunoId: 'a7', cursoId: 'c6', valor: 450, dataPagamento: '2026-04-02', status: 'Pago' },
  { id: 'p20', alunoId: 'a8', cursoId: 'c2', valor: 280, dataPagamento: '2026-04-10', status: 'Pago' },

  // May 2026
  { id: 'p21', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-05-10', status: 'Pago' },
  { id: 'p22', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-05-15', status: 'Pago' },
  { id: 'p23', alunoId: 'a3', cursoId: 'c2', valor: 280, dataPagamento: '2026-05-05', status: 'Pago' },
  { id: 'p24', alunoId: 'a4', cursoId: 'c3', valor: 190, dataPagamento: '2026-05-18', status: 'Pago' },
  { id: 'p25', alunoId: 'a5', cursoId: 'c4', valor: 220, dataPagamento: '2026-05-01', status: 'Pago' },
  { id: 'p26', alunoId: 'a6', cursoId: 'c5', valor: 310, dataPagamento: '2026-05-12', status: 'Pago' },
  { id: 'p27', alunoId: 'a7', cursoId: 'c6', valor: 450, dataPagamento: '2026-05-02', status: 'Pago' },
  { id: 'p28', alunoId: 'a8', cursoId: 'c2', valor: 280, dataPagamento: '2026-05-10', status: 'Pago' },
  { id: 'p29', alunoId: 'a9', cursoId: 'c1', valor: 350, dataPagamento: '2026-05-01', status: 'Pago' },
  { id: 'p30', alunoId: 'a10', cursoId: 'c6', valor: 450, dataPagamento: '2026-05-15', status: 'Pago' },

  // June 2026
  { id: 'p31', alunoId: 'a1', cursoId: 'c1', valor: 350, dataPagamento: '2026-06-10', status: 'Pago' },
  { id: 'p32', alunoId: 'a2', cursoId: 'c1', valor: 350, dataPagamento: '2026-06-15', status: 'Pago' },
  { id: 'p33', alunoId: 'a3', cursoId: 'c2', valor: 280, dataPagamento: '2026-06-05', status: 'Pago' },
  { id: 'p34', alunoId: 'a4', cursoId: 'c3', valor: 190, dataPagamento: '2026-06-18', status: 'Pago' },
  { id: 'p35', alunoId: 'a5', cursoId: 'c4', valor: 220, dataPagamento: '2026-06-01', status: 'Pago' },
  { id: 'p36', alunoId: 'a6', cursoId: 'c5', valor: 310, dataPagamento: '2026-06-12', status: 'Pago' },
  { id: 'p37', alunoId: 'a7', cursoId: 'c6', valor: 450, dataPagamento: '2026-06-02', status: 'Pago' },
  { id: 'p38', alunoId: 'a8', cursoId: 'c2', valor: 280, dataPagamento: '2026-06-10', status: 'Pago' },
  { id: 'p39', alunoId: 'a9', cursoId: 'c1', valor: 350, dataPagamento: '2026-06-01', status: 'Pago' },
  { id: 'p40', alunoId: 'a10', cursoId: 'c6', valor: 450, dataPagamento: '2026-06-15', status: 'Pago' },
  { id: 'p41', alunoId: 'a11', cursoId: 'c4', valor: 220, dataPagamento: '2026-06-01', status: 'Pago' },
  { id: 'p42', alunoId: 'a12', cursoId: 'c3', valor: 190, dataPagamento: '2026-06-05', status: 'Pago' }
];
