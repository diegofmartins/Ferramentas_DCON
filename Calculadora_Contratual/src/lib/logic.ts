import { 
  CalculationResult, 
  CalculationType, 
  ReajusteData, 
  RepactuacaoData, 
  RenewalData, 
  RenewalResult,
  EmpenhoYear
} from "../types";

const RETROACTIVE_BASE_DAYS = 30;

export function getDaysDifference(d1Str: string, d2Str: string): number {
  if (!d1Str || !d2Str) return 0;
  const date1 = new Date(d1Str + "T00:00:00");
  const date2 = new Date(d2Str + "T00:00:00");
  if (date2 <= date1) return 0;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay);
}

export function getDaysBetweenInclusive(d1Str: string, d2Str: string): number {
  if (!d1Str || !d2Str) return 0;
  const date1 = new Date(d1Str + "T00:00:00");
  const date2 = new Date(d2Str + "T00:00:00");
  if (date2 < date1) return 0;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay) + 1;
}

export function calculateReajustamento(data: ReajusteData): CalculationResult {
  const { vOriginal, vUnidade, dInicio, dFim, percentual, dConcessao } = data;
  
  if (!vOriginal || !dInicio || !dFim || !percentual || !dConcessao) {
    return { success: false, type: "Reajustamento", vMensalFinal: 0, totalRetroativo: 0, vMensalOriginal: 0, diasRetroativos: 0, message: "Preencha todos os campos obrigatórios.", details: data };
  }

  const vMensalOriginal = vUnidade === "Anual" ? vOriginal / 12 : vOriginal;
  const vMensalFinal = vMensalOriginal * (1 + percentual / 100);
  const diffMensal = vMensalFinal - vMensalOriginal;
  
  const diasRetroativos = getDaysDifference(dFim, dConcessao);
  const totalRetroativo = diffMensal * (diasRetroativos / RETROACTIVE_BASE_DAYS);

  return {
    success: true,
    type: "Reajustamento",
    vMensalFinal,
    totalRetroativo,
    vMensalOriginal,
    diasRetroativos,
    details: data
  };
}

export function calculateRepactuacao(data: RepactuacaoData): CalculationResult {
  const { vOriginal, vNovoAprovado, dAniversario, dSolicitacao, dProrrogacao, dConcessao } = data;
  
  if (!vOriginal || !vNovoAprovado || !dAniversario || !dSolicitacao || !dConcessao) {
    return { success: false, type: "Repactuacao", vMensalFinal: 0, totalRetroativo: 0, vMensalOriginal: 0, diasRetroativos: 0, message: "Preencha todos os campos obrigatórios.", details: data };
  }

  const isPrecluded = dProrrogacao && dSolicitacao > dProrrogacao;
  const diffMensal = vNovoAprovado - vOriginal;
  
  let totalRetroativo = 0;
  let diasRetroativos = 0;
  let preclusaoMessage = "";

  if (isPrecluded) {
    preclusaoMessage = "⚠️ Alerta de PRECLUSÃO LÓGICA! A solicitação é posterior à prorrogação.";
  } else {
    diasRetroativos = getDaysDifference(dAniversario, dConcessao);
    totalRetroativo = diffMensal * (diasRetroativos / RETROACTIVE_BASE_DAYS);
  }

  return {
    success: true,
    type: "Repactuacao",
    vMensalFinal: vNovoAprovado,
    totalRetroativo,
    vMensalOriginal: vOriginal,
    diasRetroativos,
    preclusaoMessage,
    details: data
  };
}

export function calculateRenewalEmpenho(
  result: CalculationResult,
  renewal: RenewalData
): RenewalResult | null {
  const { dInicio: dRenovStartStr, months: nMonths } = renewal;

  if (!result.success || !dRenovStartStr || nMonths <= 0) return null;

  const vMensalFinal = result.vMensalFinal;
  const vAnualTotal = vMensalFinal * nMonths;

  const dRenovStart = new Date(dRenovStartStr + "T00:00:00");
  const dRenovEnd = new Date(dRenovStart);
  dRenovEnd.setMonth(dRenovEnd.getMonth() + nMonths);
  dRenovEnd.setDate(dRenovEnd.getDate() - 1);
  const dRenovEndStr = dRenovEnd.toISOString().substring(0, 10);

  const startYear = dRenovStart.getFullYear();
  const endYear = dRenovEnd.getFullYear();
  const totalDaysRenewal = getDaysBetweenInclusive(dRenovStartStr, dRenovEndStr);

  const empenhoByYear: EmpenhoYear[] = [];
  let totalEmpenhoCalculado = 0;

  for (let currentYear = startYear; currentYear <= endYear; currentYear++) {
    const fiscalYearStartStr = `${currentYear}-01-01`;
    const fiscalYearEndStr = `${currentYear}-12-31`;
    const segmentStartStr = currentYear === startYear ? dRenovStartStr : fiscalYearStartStr;
    const segmentEndStr = currentYear === endYear ? dRenovEndStr : fiscalYearEndStr;

    const daysInYear = getDaysBetweenInclusive(segmentStartStr, segmentEndStr);
    const empenhoYear = totalDaysRenewal > 0 ? vAnualTotal * (daysInYear / totalDaysRenewal) : 0;
    
    totalEmpenhoCalculado += empenhoYear;

    empenhoByYear.push({
      year: currentYear,
      days: daysInYear,
      empenho: empenhoYear,
      fullMonths: Math.floor(daysInYear / RETROACTIVE_BASE_DAYS),
      remainingDays: daysInYear % RETROACTIVE_BASE_DAYS
    });
  }

  return {
    vMensalFinal,
    vAnualTotal,
    dRenovStart: dRenovStartStr,
    dRenovEnd: dRenovEndStr,
    nMonths,
    totalDiasRenovacao: totalDaysRenewal,
    empenhoByYear,
    totalEmpenhoCalculado
  };
}
