export interface FormularioPlanoData {
  materia: string;
  dias: number;
  horasPorDia: number;
  arquivo?: File;
}

export interface AnaliseArquivo {
  resumo: string;
  assunto: string;
  confianca: number;
}

export interface PlanoEstudoGerado {
  titulo: string;
  resumo: string;
  cronograma: DiaEstudo[];
  dicas: string[];
  materiais: string[];
}

export interface DiaEstudo {
  dia: number;
  data?: string;
  atividades: AtividadeEstudo[];
  tempoTotal: number;
}

export interface AtividadeEstudo {
  titulo: string;
  descricao: string;
  tempo: number;
  tipo: 'estudo' | 'revisao' | 'exercicio' | 'descanso';
  concluida?: boolean;
}