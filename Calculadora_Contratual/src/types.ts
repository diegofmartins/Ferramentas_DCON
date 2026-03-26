export type CalculationType = "Reajustamento" | "Repactuacao";

export interface ReajusteData {
  vOriginal: number;
  vUnidade: "Mensal" | "Anual";
  dInicio: string;
  dFim: string;
  indiceNome: string;
  percentual: number;
  dConcessao: string;
}

export interface RepactuacaoData {
  vOriginal: number;
  vNovoAprovado: number;
  dAniversario: string;
  dSolicitacao: string;
  dProrrogacao: string;
  dConcessao: string;
}

export interface RenewalData {
  months: number;
  dInicio: string;
}

export interface CalculationResult {
  success: boolean;
  type: CalculationType;
  vMensalFinal: number;
  totalRetroativo: number;
  vMensalOriginal: number;
  diasRetroativos: number;
  message?: string;
  preclusaoMessage?: string;
  details: any;
}

export interface EmpenhoYear {
  year: number;
  days: number;
  empenho: number;
  fullMonths: number;
  remainingDays: number;
}

export interface RenewalResult {
  vMensalFinal: number;
  vAnualTotal: number;
  dRenovStart: string;
  dRenovEnd: string;
  nMonths: number;
  totalDiasRenovacao: number;
  empenhoByYear: EmpenhoYear[];
  totalEmpenhoCalculado: number;
}
