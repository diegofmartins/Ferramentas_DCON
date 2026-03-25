export interface ETPData {
  processo_spae: string;
  unidade_requisitante: string;
  responsavel: string;
  justificativa_necessidade: string;
  levantamento_mercado: string;
  objeto_sucinto: string;
  descricao_solucao_integral: string;
  requisitos_exigencias: string;
  requisitos_qualidade: string;
  requisitos_marca: string;
  requisitos_amostra: string;
  requisitos_transicao: string;
  garantia_contratual: string;
  garantia_tecnica: string;
  assistencia_tecnica: string;
  requisitos_vistoria: string;
  requisitos_subcontratacao: string;
  requisitos_execucao: string;
  requisitos_dimensionamento: string;
  estimativa_quantidades_texto: string;
  tabela_quantitativos: string;
  estimativa_valor_texto: string;
  tabela_precos: string;
  justificativa_parcelamento: string;
  resultados_pretendidos: string;
  providencias_adm: string;
  contratacoes_correlatas: string;
  impactos_ambientais: string;
  alinhamento_planejamento: string;
  posicionamento_conclusivo: string;
  analise_riscos_resumo: string;
  tabela_riscos_interna: string;
  tabela_riscos_externa: string;
}

export type ETPField = keyof ETPData;

export interface ETPStructureItem {
  id: ETPField;
  label: string;
  icon: string;
  section?: string;
  isAiEnabled?: boolean;
}
