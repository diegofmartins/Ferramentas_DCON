import { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Printer, 
  RotateCcw, 
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

import { 
  CalculationType, 
  ReajusteData, 
  RepactuacaoData, 
  RenewalData, 
  CalculationResult, 
  RenewalResult 
} from "./types";
import { 
  calculateReajustamento, 
  calculateRepactuacao, 
  calculateRenewalEmpenho 
} from "./lib/logic";
import { cn, formatCurrency, formatDate } from "./lib/utils";

export default function App() {
  const [type, setType] = useState<CalculationType>("Reajustamento");
  const [reajData, setReajData] = useState<ReajusteData>({
    vOriginal: 0,
    vUnidade: "Mensal",
    dInicio: "",
    dFim: "",
    indiceNome: "",
    percentual: 0,
    dConcessao: ""
  });
  const [repacData, setRepacData] = useState<RepactuacaoData>({
    vOriginal: 0,
    vNovoAprovado: 0,
    dAniversario: "",
    dSolicitacao: "",
    dProrrogacao: "",
    dConcessao: ""
  });
  const [renewalData, setRenewalData] = useState<RenewalData>({
    months: 12,
    dInicio: ""
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [renewalResult, setRenewalResult] = useState<RenewalResult | null>(null);
  const [showMemory, setShowMemory] = useState(false);

  // Persistência básica no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("contract_calc_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type) setType(parsed.type);
        if (parsed.reajData) setReajData(parsed.reajData);
        if (parsed.repacData) setRepacData(parsed.repacData);
        if (parsed.renewalData) setRenewalData(parsed.renewalData);
      } catch (e) {
        console.error("Error loading state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contract_calc_state", JSON.stringify({
      type, reajData, repacData, renewalData
    }));
  }, [type, reajData, repacData, renewalData]);

  const handleCalculate = () => {
    let res: CalculationResult;
    if (type === "Reajustamento") {
      res = calculateReajustamento(reajData);
    } else {
      res = calculateRepactuacao(repacData);
    }
    setResult(res);
    
    if (res.success && renewalData.dInicio) {
      const renRes = calculateRenewalEmpenho(res, renewalData);
      setRenewalResult(renRes);
    } else {
      setRenewalResult(null);
    }
  };

  const handleReset = () => {
    if (confirm("Deseja realmente apagar todos os dados?")) {
      localStorage.removeItem("contract_calc_state");
      window.location.reload();
    }
  };

  const chartData = useMemo(() => {
    if (!renewalResult) return [];
    return renewalResult.empenhoByYear.map(item => ({
      name: `Ano ${item.year}`,
      valor: item.empenho,
      fullLabel: `${item.fullMonths}m ${item.remainingDays}d`
    }));
  }, [renewalResult]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-200">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Calculadora Contratual</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lei 14.133/2021</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Sidebar: Inputs */}
          <div className="lg:col-span-5 space-y-6 no-print">
            
            {/* Step 1: Mode Selection */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-cyan-700">
                <TrendingUp size={20} />
                <h2 className="font-bold">1. Modalidade</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button 
                  onClick={() => setType("Reajustamento")}
                  className={cn(
                    "rounded-lg py-2 text-sm font-bold transition",
                    type === "Reajustamento" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Reajustamento
                </button>
                <button 
                  onClick={() => setType("Repactuacao")}
                  className={cn(
                    "rounded-lg py-2 text-sm font-bold transition",
                    type === "Repactuacao" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Repactuação
                </button>
              </div>
            </section>

            {/* Step 2: Data Entry */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 text-cyan-700">
                <FileText size={20} />
                <h2 className="font-bold">2. Dados do Contrato</h2>
              </div>

              <div className="space-y-4">
                {type === "Reajustamento" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor Base (R$)</label>
                        <input 
                          type="number" 
                          value={reajData.vOriginal || ""} 
                          onChange={e => setReajData({...reajData, vOriginal: parseFloat(e.target.value) || 0})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:outline-none"
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unidade</label>
                        <select 
                          value={reajData.vUnidade} 
                          onChange={e => setReajData({...reajData, vUnidade: e.target.value as any})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="Mensal">Mensal</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Percentual (%)</label>
                        <input 
                          type="number" 
                          step="0.0001"
                          value={reajData.percentual || ""} 
                          onChange={e => setReajData({...reajData, percentual: parseFloat(e.target.value) || 0})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Início Período</label>
                        <input 
                          type="date" 
                          value={reajData.dInicio} 
                          onChange={e => setReajData({...reajData, dInicio: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fim Período (Direito)</label>
                        <input 
                          type="date" 
                          value={reajData.dFim} 
                          onChange={e => setReajData({...reajData, dFim: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Concessão</label>
                      <input 
                        type="date" 
                        value={reajData.dConcessao} 
                        onChange={e => setReajData({...reajData, dConcessao: e.target.value})}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor Anterior (R$)</label>
                        <input 
                          type="number" 
                          value={repacData.vOriginal || ""} 
                          onChange={e => setRepacData({...repacData, vOriginal: parseFloat(e.target.value) || 0})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:outline-none"
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Novo Valor (R$)</label>
                        <input 
                          type="number" 
                          value={repacData.vNovoAprovado || ""} 
                          onChange={e => setRepacData({...repacData, vNovoAprovado: parseFloat(e.target.value) || 0})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:outline-none"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Aniversário</label>
                        <input 
                          type="date" 
                          value={repacData.dAniversario} 
                          onChange={e => setRepacData({...repacData, dAniversario: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Solicitação</label>
                        <input 
                          type="date" 
                          value={repacData.dSolicitacao} 
                          onChange={e => setRepacData({...repacData, dSolicitacao: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prorrogação (Opcional)</label>
                        <input 
                          type="date" 
                          value={repacData.dProrrogacao} 
                          onChange={e => setRepacData({...repacData, dProrrogacao: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Concessão</label>
                        <input 
                          type="date" 
                          value={repacData.dConcessao} 
                          onChange={e => setRepacData({...repacData, dConcessao: e.target.value})}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Step 3: Renewal Planning */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-cyan-700">
                <Calendar size={20} />
                <h2 className="font-bold">3. Planejamento de Renovação</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meses</label>
                  <input 
                    type="number" 
                    value={renewalData.months} 
                    onChange={e => setRenewalData({...renewalData, months: parseInt(e.target.value) || 0})}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Início Renovação</label>
                  <input 
                    type="date" 
                    value={renewalData.dInicio} 
                    onChange={e => setRenewalData({...renewalData, dInicio: e.target.value})}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <button 
              onClick={handleCalculate}
              className="w-full rounded-2xl bg-cyan-600 py-4 text-lg font-bold text-white shadow-xl shadow-cyan-100 transition hover:bg-cyan-700 active:scale-95"
            >
              Calcular Reajuste
            </button>
          </div>

          {/* Main Content: Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {!result ? (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="mb-4 rounded-full bg-slate-50 p-6 text-slate-300">
                  <Calculator size={64} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Aguardando Cálculo</h3>
                <p className="mt-2 text-slate-500">Preencha os dados à esquerda e clique em calcular para ver os resultados detalhados.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Novo Valor Mensal</p>
                    <p className="mt-2 text-3xl font-black text-cyan-600">{formatCurrency(result.vMensalFinal)}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <TrendingUp size={14} />
                      <span>Aumento de {formatCurrency(result.vMensalFinal - result.vMensalOriginal)}</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Retroativo</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{formatCurrency(result.totalRetroativo)}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Calendar size={14} />
                      <span>Referente a {result.diasRetroativos} dias</span>
                    </div>
                  </div>
                </div>

                {/* Preclusão Alert */}
                {result.preclusaoMessage && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                    <p className="text-sm font-semibold">{result.preclusaoMessage}</p>
                  </div>
                )}

                {/* Budget Planning Chart */}
                {renewalResult && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm no-print">
                    <div className="mb-6 flex items-center gap-2 text-slate-900">
                      <TrendingUp size={18} />
                      <h3 className="font-bold">Impacto Orçamentário Anual</h3>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(value) => `R$ ${value/1000}k`}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                                    <p className="text-xs font-bold text-slate-500 uppercase">{payload[0].payload.name}</p>
                                    <p className="text-lg font-black text-cyan-600">{formatCurrency(payload[0].value as number)}</p>
                                    <p className="text-[10px] font-medium text-slate-400">{payload[0].payload.fullLabel}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#0891b2' : '#0e7490'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                {/* Memory of Calculation Toggle */}
                <div className="no-print">
                  <button 
                    onClick={() => setShowMemory(!showMemory)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={18} />
                      <span>Ver Memória de Cálculo Detalhada</span>
                    </div>
                    {showMemory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Detailed Memory (Print Area) */}
                <AnimatePresence>
                  {(showMemory || true) && (
                    <motion.section 
                      initial={showMemory ? { height: 0, opacity: 0 } : false}
                      animate={showMemory ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      className={cn(
                        "print-area overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg",
                        !showMemory && "hidden print:block"
                      )}
                    >
                      <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 text-center">
                        <h2 className="text-2xl font-black text-slate-900">Memória de Cálculo</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Documento Técnico • Lei 14.133/2021</p>
                      </div>
                      
                      <div className="p-8 space-y-8 text-slate-700">
                        {/* 1. Identification */}
                        <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-8">
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modalidade</h4>
                            <p className="mt-1 font-bold text-slate-900">{result.type}</p>
                          </div>
                          <div className="text-right">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Geração</h4>
                            <p className="mt-1 font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        {/* 2. Values */}
                        <div className="space-y-4">
                          <h3 className="flex items-center gap-2 font-black text-slate-900">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
                            1. Demonstração de Valores
                          </h3>
                          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-6">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Valor Anterior</p>
                              <p className="text-lg font-bold text-slate-900">{formatCurrency(result.vMensalOriginal)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Novo Valor</p>
                              <p className="text-lg font-bold text-slate-900">{formatCurrency(result.vMensalFinal)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Diferença Mensal</p>
                              <p className="text-lg font-bold text-cyan-600">+{formatCurrency(result.vMensalFinal - result.vMensalOriginal)}</p>
                            </div>
                          </div>
                        </div>

                        {/* 3. Retroactive Calculation */}
                        <div className="space-y-4">
                          <h3 className="flex items-center gap-2 font-black text-slate-900">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            2. Apuração do Retroativo
                          </h3>
                          <div className="space-y-2 rounded-2xl border border-slate-100 p-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Período Devido</span>
                              <span className="font-bold">
                                {result.type === "Reajustamento" 
                                  ? `${formatDate(result.details.dFim)} a ${formatDate(result.details.dConcessao)}`
                                  : `${formatDate(result.details.dAniversario)} a ${formatDate(result.details.dConcessao)}`
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total de Dias</span>
                              <span className="font-bold">{result.diasRetroativos} dias</span>
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-4 font-mono text-xs text-slate-400 italic">
                              Fórmula: (Diferença Mensal × Dias) / 30
                            </div>
                            <div className="flex justify-between pt-2 text-xl font-black text-emerald-600">
                              <span>Total Retroativo</span>
                              <span>{formatCurrency(result.totalRetroativo)}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. Renewal Planning */}
                        {renewalResult && (
                          <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-black text-slate-900">
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                              3. Planejamento de Empenho
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-slate-100">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-6 py-3 font-bold text-slate-500">Ano Fiscal</th>
                                    <th className="px-6 py-3 font-bold text-slate-500">Período</th>
                                    <th className="px-6 py-3 text-right font-bold text-slate-500">Valor Empenho</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {renewalResult.empenhoByYear.map(item => (
                                    <tr key={item.year}>
                                      <td className="px-6 py-4 font-bold">{item.year}</td>
                                      <td className="px-6 py-4 text-slate-500">{item.fullMonths}m {item.remainingDays}d</td>
                                      <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatCurrency(item.empenho)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-slate-50/50">
                                  <tr>
                                    <td colSpan={2} className="px-6 py-4 font-bold text-slate-900">Total Planejado</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(renewalResult.vAnualTotal)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-8 text-center text-[10px] text-slate-300 italic">
                          Documento gerado eletronicamente. Base legal: Lei nº 14.133/2021.
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Info (Mobile Only) */}
      <div className="fixed bottom-6 right-6 sm:hidden no-print">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl">
          <Info size={24} />
        </button>
      </div>
    </div>
  );
}
