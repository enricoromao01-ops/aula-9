export interface Curso {
  id: string;
  nome: string;
  valorMensalidade: number;
  duracaoMeses: number;
  categoria: string;
  status: 'Ativo' | 'Inativo';
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataMatricula: string; // ISO date string YYYY-MM-DD
  status: 'Ativo' | 'Inativo';
}

export interface Matricula {
  id: string;
  alunoId: string;
  cursoId: string;
  dataInicio: string;
  status: 'Ativo' | 'Inativo';
}

export interface Pagamento {
  id: string;
  alunoId: string;
  cursoId: string;
  valor: number;
  dataPagamento: string; // ISO date string YYYY-MM-DD
  status: 'Pago' | 'Pendente' | 'Atrasado';
}
