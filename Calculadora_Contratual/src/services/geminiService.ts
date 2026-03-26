import { GoogleGenAI } from "@google/genai";
import { CalculationResult, RenewalResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function explainCalculation(
  result: CalculationResult,
  renewal: RenewalResult | null
) {
  const prompt = `
    Como um especialista em licitações e contratos públicos brasileiros (Lei 14.133/2021), 
    analise o seguinte cálculo de reajuste contratual e gere uma justificativa técnica curta e profissional.
    
    TIPO: ${result.type}
    VALOR ANTERIOR: R$ ${result.vMensalOriginal.toFixed(2)}
    VALOR NOVO: R$ ${result.vMensalFinal.toFixed(2)}
    RETROATIVO: R$ ${result.totalRetroativo.toFixed(2)} (${result.diasRetroativos} dias)
    
    ${result.type === 'Repactuacao' ? `
    DATAS REPACTUAÇÃO:
    - Aniversário (Fato Gerador): ${result.details.dAniversario}
    - Solicitação: ${result.details.dSolicitacao}
    - Prorrogação: ${result.details.dProrrogacao}
    ` : `
    DETALHES REAJUSTE:
    - Índice: ${result.details.indiceNome}
    - Percentual: ${result.details.percentual}%
    `}
    
    ${renewal ? `
    PLANEJAMENTO RENOVAÇÃO:
    - Período: ${renewal.nMonths} meses
    - Início: ${renewal.dRenovStart}
    - Valor Total: R$ ${renewal.vAnualTotal.toFixed(2)}
    ` : ''}
    
    Por favor:
    1. Confirme a base legal (Art. 135 para Reajuste ou Art. 131 para Repactuação).
    2. Verifique se há indícios de preclusão lógica (especialmente em repactuação).
    3. Explique brevemente o impacto orçamentário.
    4. Use um tom formal e técnico.
    Responda em Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar a análise automática no momento.";
  }
}
