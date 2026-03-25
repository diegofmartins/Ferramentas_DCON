import { useState, useEffect, Fragment } from 'react';
import { 
  FileText, 
  ClipboardList, 
  Target, 
  CheckCircle, 
  Sparkles, 
  Loader2, 
  Printer, 
  Layout, 
  BarChart, 
  ShieldCheck, 
  Leaf, 
  Settings, 
  Zap, 
  Wand2, 
  Eye, 
  Edit3, 
  AlertTriangle 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { ETPData, ETPField, ETPStructureItem } from './types';

const SYSTEM_PROMPT = `Você é um consultor jurídico especializado em licitações (Lei 14.133/21). 
REGRAS CRÍTICAS DE RESPOSTA:
1. Forneça APENAS o texto técnico do tópico solicitado.
2. NÃO use formatação Markdown (sem #, sem **, sem *, sem >).
3. NÃO inclua introduções ou conclusões.
4. NÃO inclua títulos.
5. Use linguagem formal, impessoal e técnica.
6. Se houver listas, use hífens (-) ou letras (a, b, c).`;

const structure: ETPStructureItem[] = [
  { id: 'processo_spae', label: 'Nº Processo SPAE', icon: 'FileText', section: 'I - INFORMAÇÕES GERAIS', isAiEnabled: false },
  { id: 'unidade_requisitante', label: 'Área Demandante', icon: 'Target', section: 'I - INFORMAÇÕES GERAIS', isAiEnabled: false },
  { id: 'responsavel', label: 'Responsável', icon: 'Settings', section: 'I - INFORMAÇÕES GERAIS', isAiEnabled: false },
  
  { id: 'justificativa_necessidade', label: '2. Descrição da Necessidade (Justificativa)', icon: 'ClipboardList', section: 'II - DEMANDA E PROSPECÇÃO', isAiEnabled: true },
  { id: 'levantamento_mercado', label: '3. Levantamento de Mercado', icon: 'BarChart', section: 'II - DEMANDA E PROSPECÇÃO', isAiEnabled: true },
  
  { id: 'objeto_sucinto', label: '4. Descrição Sucinta do Objeto', icon: 'Target', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'descricao_solucao_integral', label: '5. Descrição da Solução Integral', icon: 'Layout', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  
  { id: 'requisitos_exigencias', label: '6.1. Exigências Internas e Externas', icon: 'ShieldCheck', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_qualidade', label: '6.2. Padrões de Qualidade', icon: 'CheckCircle', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_marca', label: '6.2.1. Marca de Referência', icon: 'Target', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_amostra', label: '6.3. Amostra ou POC', icon: 'Eye', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_transicao', label: '6.4. Transição Contratual', icon: 'Zap', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'garantia_contratual', label: '6.5.2. Garantia Contratual', icon: 'ShieldCheck', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'garantia_tecnica', label: '6.5.3. Garantia Técnica', icon: 'ShieldCheck', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'assistencia_tecnica', label: '6.5.4. Manutenção e Assistência', icon: 'Settings', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_vistoria', label: '6.6. Necessidade de Vistoria', icon: 'Eye', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_subcontratacao', label: '6.7. Subcontratação', icon: 'Layout', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_execucao', label: '6.8. Execução do Objeto', icon: 'Zap', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'requisitos_dimensionamento', label: '6.9. Dimensionamento da Proposta', icon: 'BarChart', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  
  { id: 'estimativa_quantidades_texto', label: '7. Estimativa de Quantidades (Texto)', icon: 'FileText', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'tabela_quantitativos', label: '7. Tabela de Quantitativos', icon: 'Layout', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  
  { id: 'estimativa_valor_texto', label: '8. Estimativa do Valor (Texto)', icon: 'Zap', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'tabela_precos', label: '8. Tabela de Preços Estimados', icon: 'Layout', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  
  { id: 'justificativa_parcelamento', label: '9. Justificativa de Parcelamento', icon: 'AlertTriangle', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'resultados_pretendidos', label: '10. Resultados Pretendidos', icon: 'CheckCircle', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'providencias_adm', label: '11. Providências da Administração', icon: 'Settings', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'contratacoes_correlatas', label: '12. Contratações Correlatas', icon: 'Layout', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'impactos_ambientais', label: '13. Impactos Ambientais', icon: 'Leaf', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  { id: 'alinhamento_planejamento', label: '14. Alinhamento ao Planejamento', icon: 'Target', section: 'III - DESCRIÇÃO DA SOLUÇÃO', isAiEnabled: true },
  
  { id: 'posicionamento_conclusivo', label: '15. Posicionamento Conclusivo', icon: 'ShieldCheck', section: 'IV - POSICIONAMENTO CONCLUSIVO', isAiEnabled: true },
  
  { id: 'analise_riscos_resumo', label: '16. Análise de Riscos (Resumo)', icon: 'AlertTriangle', section: 'V - GESTÃO DE RISCOS', isAiEnabled: true },
  { id: 'tabela_riscos_interna', label: 'Anexo I - Riscos Fase Interna', icon: 'Layout', section: 'V - GESTÃO DE RISCOS', isAiEnabled: true },
  { id: 'tabela_riscos_externa', label: 'Anexo I - Riscos Fase Externa', icon: 'Layout', section: 'V - GESTÃO DE RISCOS', isAiEnabled: true },
];

const IconMap: Record<string, any> = {
  FileText,
  ClipboardList,
  Target,
  CheckCircle,
  Sparkles,
  Loader2,
  Printer,
  Layout,
  BarChart,
  ShieldCheck,
  Leaf,
  Settings,
  Zap,
  Wand2,
  Eye,
  Edit3,
  AlertTriangle
};

const Icon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
  const LucideIcon = IconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
};

const INITIAL_STATE: ETPData = {
  processo_spae: '', unidade_requisitante: '', responsavel: '',
  justificativa_necessidade: '', levantamento_mercado: '',
  objeto_sucinto: '', descricao_solucao_integral: '',
  requisitos_exigencias: '', requisitos_qualidade: '', requisitos_marca: '',
  requisitos_amostra: '', requisitos_transicao: '',
  garantia_contratual: '', garantia_tecnica: '', assistencia_tecnica: '',
  requisitos_vistoria: '', requisitos_subcontratacao: '', requisitos_execucao: '', requisitos_dimensionamento: '',
  estimativa_quantidades_texto: '', tabela_quantitativos: '',
  estimativa_valor_texto: '', tabela_precos: '',
  justificativa_parcelamento: '', resultados_pretendidos: '',
  providencias_adm: '', contratacoes_correlatas: '',
  impactos_ambientais: '', alinhamento_planejamento: '',
  posicionamento_conclusivo: '', analise_riscos_resumo: '',
  tabela_riscos_interna: '', tabela_riscos_externa: ''
};

export default function App() {
  const [formData, setFormData] = useState<ETPData>(INITIAL_STATE);

  const [isGenerating, setIsGenerating] = useState<ETPField | 'global' | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('etp_pro_v4');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('etp_pro_v4', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleAiAssist = async (fieldId: ETPField) => {
    setApiError(null);
    setIsGenerating(fieldId);
    const field = structure.find(s => s.id === fieldId);
    const fieldName = field?.label;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Com base no objeto "${formData.objeto_sucinto}" e na necessidade "${formData.justificativa_necessidade}", redija a seção "${fieldName}" deste Estudo Técnico Preliminar conforme a Lei 14.133/21.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const result = response.text;
      if (result) {
        setFormData(prev => ({ ...prev, [fieldId]: result.trim() }));
      }
    } catch (err: any) {
      setApiError(err.message || "Erro ao gerar conteúdo");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGlobalGenerate = async () => {
    setApiError(null);
    setIsGenerating('global');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Aja como um revisor jurídico sênior. Revise e complete todos os campos deste ETP seguindo a Lei 14.133/21. Remova redundâncias.
      
      DADOS ATUAIS: ${JSON.stringify(formData)}
      
      Retorne obrigatoriamente um JSON puro com todos os campos do formulário. Não use markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });

      const resultText = response.text;
      if (resultText) {
        const updatedData = JSON.parse(resultText);
        setFormData(updatedData);
        setViewMode('preview');
      }
    } catch (err: any) {
      setApiError(err.message || "Erro ao processar revisão global");
    } finally {
      setIsGenerating(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ETP DIGITAL</title>
            <style>
              body { font-family: "Inter", sans-serif; padding: 2cm; color: #1a1a1a; line-height: 1.6; }
              .doc-container { max-width: 21cm; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .header h1 { font-size: 18pt; margin: 0; text-transform: uppercase; }
              .section-title { background: #f0f0f0; padding: 8px 12px; font-weight: bold; text-transform: uppercase; margin-top: 30px; border: 1px solid #ccc; font-size: 12pt; }
              .field-title { font-weight: bold; text-transform: uppercase; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 4px; font-size: 11pt; }
              .field-content { font-size: 10.5pt; text-align: justify; margin-bottom: 15px; white-space: pre-wrap; color: #333; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border: 1px solid #000; margin-bottom: 20px; }
              .info-item { padding: 8px; border-right: 1px solid #000; }
              .info-item:last-child { border-right: none; }
              .info-label { font-weight: bold; font-size: 9pt; text-transform: uppercase; display: block; margin-bottom: 4px; }
              .info-value { font-size: 10pt; }
              .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; }
              .signature-box { border-top: 1px solid #000; padding-top: 8px; text-align: center; font-size: 9pt; }
              @media print {
                body { padding: 0; }
                .doc-container { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="doc-container">
              <div class="header">
                <h1>ESTUDO TÉCNICO PRELIMINAR</h1>
              </div>

              <div class="section-title">I - INFORMAÇÕES GERAIS</div>
              <div class="field-title">1. IDENTIFICAÇÃO DO PROCESSO E ÁREA REQUISITANTE</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nº Processo SPAE</span>
                  <div class="info-value">${formData.processo_spae || '---'}</div>
                </div>
                <div class="info-item">
                  <span class="info-label">Área Demandante</span>
                  <div class="info-value">${formData.unidade_requisitante || '---'}</div>
                </div>
                <div class="info-item">
                  <span class="info-label">Responsável</span>
                  <div class="info-value">${formData.responsavel || '---'}</div>
                </div>
              </div>

              <div class="section-title">II - DEMANDA E PROSPECÇÃO DE SOLUÇÕES</div>
              <div class="field-title">2. DESCRIÇÃO DA NECESSIDADE DA CONTRATAÇÃO (JUSTIFICATIVA)</div>
              <div class="field-content">${formData.justificativa_necessidade || '---'}</div>

              <div class="field-title">3. LEVANTAMENTO DE MERCADO E ANÁLISE DAS ALTERNATIVAS POSSÍVEIS</div>
              <div class="field-content">${formData.levantamento_mercado || '---'}</div>

              <div class="section-title">III - DESCRIÇÃO DA SOLUÇÃO ESCOLHIDA</div>
              <div class="field-title">4. DESCRIÇÃO SUCINTA DO OBJETO</div>
              <div class="field-content">${formData.objeto_sucinto || '---'}</div>

              <div class="field-title">5. DESCRIÇÃO DA SOLUÇÃO COMO UM TODO</div>
              <div class="field-content">${formData.descricao_solucao_integral || '---'}</div>

              <div class="field-title">6. DESCRIÇÃO DOS REQUISITOS DA CONTRATAÇÃO</div>
              <div class="field-title">6.1. Exigências internas e Externas</div>
              <div class="field-content">${formData.requisitos_exigencias || '---'}</div>
              
              <div class="field-title">6.2. Padrões de Qualidade Exigidos</div>
              <div class="field-content">${formData.requisitos_qualidade || '---'}</div>
              <div class="field-content"><strong>Marca de Referência:</strong> ${formData.requisitos_marca || '---'}</div>

              <div class="field-title">6.3. Exigência de Amostra ou Prova de Conceito (POC)</div>
              <div class="field-content">${formData.requisitos_amostra || '---'}</div>

              <div class="field-title">6.4. Necessidade de transição contratual</div>
              <div class="field-content">${formData.requisitos_transicao || '---'}</div>

              <div class="field-title">6.5. Garantia, Manutenção e Assistência Técnica</div>
              <div class="field-content"><strong>Garantia Contratual:</strong> ${formData.garantia_contratual || '---'}</div>
              <div class="field-content"><strong>Garantia Técnica:</strong> ${formData.garantia_tecnica || '---'}</div>
              <div class="field-content"><strong>Exigências de manutenção e assistência técnica:</strong> ${formData.assistencia_tecnica || '---'}</div>

              <div class="field-title">6.6. Necessidade de Vistoria</div>
              <div class="field-content">${formData.requisitos_vistoria || '---'}</div>

              <div class="field-title">6.7. Subcontratação</div>
              <div class="field-content">${formData.requisitos_subcontratacao || '---'}</div>

              <div class="field-title">6.8. Execução do Objeto</div>
              <div class="field-content">${formData.requisitos_execucao || '---'}</div>

              <div class="field-title">6.9. Informações Importantes para o Dimensionamento da Proposta</div>
              <div class="field-content">${formData.requisitos_dimensionamento || '---'}</div>

              <div class="field-title">7. ESTIMATIVA DAS QUANTIDADES</div>
              <div class="field-content">${formData.estimativa_quantidades_texto || '---'}</div>
              <div class="field-content"><strong>Tabela de Quantitativos:</strong> ${formData.tabela_quantitativos || '---'}</div>

              <div class="field-title">8. ESTIMATIVA DO VALOR DA CONTRATAÇÃO</div>
              <div class="field-content">${formData.estimativa_valor_texto || '---'}</div>
              <div class="field-content"><strong>Tabela de Preços Estimados:</strong> ${formData.tabela_precos || '---'}</div>

              <div class="field-title">9. JUSTIFICATIVAS PARA O PARCELAMENTO OU NÃO DA CONTRATAÇÃO</div>
              <div class="field-content">${formData.justificativa_parcelamento || '---'}</div>

              <div class="field-title">10. DEMONSTRATIVO DOS RESULTADOS PRETENDIDOS</div>
              <div class="field-content">${formData.resultados_pretendidos || '---'}</div>

              <div class="field-title">11. PROVIDÊNCIAS A SEREM ADOTADAS PELA ADMINISTRAÇÃO</div>
              <div class="field-content">${formData.providencias_adm || '---'}</div>

              <div class="field-title">12. CONTRATAÇÕES CORRELATAS E/OU INTERDEPENDENTES</div>
              <div class="field-content">${formData.contratacoes_correlatas || '---'}</div>

              <div class="field-title">13. DESCRIÇÃO DE POSSÍVEIS IMPACTOS AMBIENTAIS E RESPECTIVAS MEDIDAS MITIGADORAS</div>
              <div class="field-content">${formData.impactos_ambientais || '---'}</div>

              <div class="field-title">14. ALINHAMENTO ENTRE A CONTRATAÇÃO E O PLANEJAMENTO</div>
              <div class="field-content">${formData.alinhamento_planejamento || '---'}</div>

              <div class="section-title">IV - POSICIONAMENTO CONCLUSIVO</div>
              <div class="field-title">15. POSICIONAMENTO CONCLUSIVO</div>
              <div class="field-content">${formData.posicionamento_conclusivo || '---'}</div>

              <div class="section-title">V - GESTÃO DE RISCOS</div>
              <div class="field-title">16. ANÁLISE DE RISCOS</div>
              <div class="field-content">${formData.analise_riscos_resumo || '---'}</div>

              <div class="field-title">ANEXO I - MAPA DE RISCOS</div>
              <div class="field-content"><strong>Fase Interna:</strong> ${formData.tabela_riscos_interna || '---'}</div>
              <div class="field-content"><strong>Fase Externa:</strong> ${formData.tabela_riscos_externa || '---'}</div>

              <div class="signature-grid">
                <div class="signature-box">NOME DO SERVIDOR ENVOLVIDO<br/>Lotação</div>
                <div class="signature-box">NOME DO SERVIDOR ENVOLVIDO<br/>Lotação</div>
              </div>
            </div>
            <script>
              window.onload = () => {
                window.focus();
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.focus();
      window.print();
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <Icon name="Wand2" size={18} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-tight">ETP DIGITAL</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')} 
              className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              {viewMode === 'edit' ? <Fragment><Icon name="Eye" size={14} /> Visualizar</Fragment> : <Fragment><Icon name="Edit3" size={14} /> Editar</Fragment>}
            </button>
            <button 
              onClick={handleGlobalGenerate} 
              disabled={!!isGenerating} 
              className={`flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 border border-indigo-200 transition-all disabled:opacity-50 ${!isGenerating ? 'ai-glow' : ''}`}
            >
              {isGenerating === 'global' ? <Loader2 size={14} className="animate-spin" /> : <Icon name="Sparkles" size={14} />}
              Polimento Final
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
            >
              <Icon name="Printer" size={16} /> PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 no-print">
        <AnimatePresence>
          {apiError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-800"
            >
              <Icon name="AlertTriangle" size={24} className="flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm">Falha Técnica na IA</p>
                <p className="text-xs opacity-80 leading-relaxed">{apiError}</p>
              </div>
              <button onClick={() => setApiError(null)} className="p-1 hover:bg-red-100 rounded">OK</button>
            </motion.div>
          )}
        </AnimatePresence>

        {viewMode === 'edit' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 space-y-1 sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              {Object.entries(structure.reduce((acc, item) => {
                const section = item.section || 'Outros';
                if (!acc[section]) acc[section] = [];
                acc[section].push(item);
                return acc;
              }, {} as Record<string, ETPStructureItem[]>)).map(([section, items]) => (
                <div key={section} className="mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-4">{section}</h4>
                  {items.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({behavior:'smooth', block:'center'})} 
                      className="w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name={item.icon} size={14} className="opacity-50 group-hover:opacity-100" />
                        {item.label}
                      </span>
                      {(formData[item.id]?.length || 0) > 5 && <Icon name="CheckCircle" size={10} className="text-green-500" />}
                    </button>
                  ))}
                </div>
              ))}
            </aside>
            <div className="flex-1 space-y-6">
              {structure.map((item) => (
                <div key={item.id} id={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24">
                  <div className="px-6 py-3 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</h3>
                    {item.isAiEnabled !== false && (
                      <button 
                        onClick={() => handleAiAssist(item.id)} 
                        disabled={isGenerating !== null} 
                        className="text-[9px] font-black text-indigo-600 uppercase bg-white border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-50 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isGenerating === item.id ? <Loader2 size={10} className="animate-spin" /> : <Icon name="Sparkles" size={10} />}
                        Gerar com IA
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <textarea 
                      value={formData[item.id] || ''} 
                      onChange={(e) => setFormData({...formData, [item.id]: e.target.value})} 
                      className="textarea-clean min-h-[100px]" 
                      placeholder="Preencha ou use a IA..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow-2xl p-16 border border-slate-200 max-w-4xl mx-auto etp-doc rounded-3xl"
          >
            <div className="text-center mb-12 border-b-2 border-black pb-8">
              <h1 className="text-xl font-bold uppercase underline">Estudo Técnico Preliminar (ETP)</h1>
              <p className="text-xs font-bold mt-2">Câmara Municipal de Curitiba</p>
            </div>
            
            <div className="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Nº Processo SPAE</span>
                  <span className="text-sm font-medium">{formData.processo_spae || '---'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Área Demandante</span>
                  <span className="text-sm font-medium">{formData.unidade_requisitante || '---'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Responsável</span>
                  <span className="text-sm font-medium">{formData.responsavel || '---'}</span>
                </div>
              </div>
            </div>

            {Object.entries(structure.reduce((acc, item) => {
              const section = item.section || 'Outros';
              if (!acc[section]) acc[section] = [];
              acc[section].push(item);
              return acc;
            }, {} as Record<string, ETPStructureItem[]>)).map(([section, items]) => (
              <div key={section} className="mb-12">
                <h3 className="text-lg font-black text-indigo-600 mb-6 border-b-2 border-indigo-100 pb-2">{section}</h3>
                {items.map(item => (
                  <div key={item.id} className="mb-8">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">{item.label}</h4>
                    <p className="text-sm text-justify leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {formData[item.id] || "Pendente."}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <div className="print-only etp-doc">
        <div style={{textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid black', paddingBottom: '20px'}}>
          <h1 style={{fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase'}}>Estudo Técnico Preliminar</h1>
          <p style={{fontSize: '10pt'}}>Administração Pública Direta e Indireta - Lei 14.133/21</p>
        </div>
        {structure.map(item => (
          <div key={item.id} style={{marginBottom: '25px'}}>
            <h2 style={{fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid black', marginTop: '15pt', paddingBottom: '3pt'}}>{item.label}</h2>
            <p style={{fontSize: '11pt', textAlign: 'justify', marginBottom: '10pt', lineHeight: '1.5', whiteSpace: 'pre-wrap'}}>{formData[item.id] || "Não informado."}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isGenerating === 'global' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-xs"
            >
              <Loader2 size={40} className="mx-auto mb-4 text-indigo-600 animate-spin" />
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Consolidando</h3>
              <p className="text-slate-500 text-xs font-medium">Refinando rascunhos com IA...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
