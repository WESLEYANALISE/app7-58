// Exportar as interfaces do componente original
export interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  textColor?: string;
}

export interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

// Exportar o componente ultra otimizado
export { default } from './VadeMecumUltraFast';
export { default as VadeMecum } from './VadeMecumUltraFast';