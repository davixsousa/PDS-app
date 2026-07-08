import React, { useState, useEffect } from 'react';
import { Wallet, Sparkles, Plus, Trash2, HelpCircle, FileText, ChevronDown, CheckCircle, PieChart, Info, ArrowUpRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface FinancasProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

// Predefined subcategories and keywords requested by the user
const CATEGORIES_CONFIG = {
  indispensaveis: {
    title: 'Gastos indispensáveis',
    subtitle: 'Necessários para sobreviver',
    color: '#6366F1', // indigo
    bgClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Bens e serviços vitais para a subsistência diária, alimentação, saúde e manutenção básica do lar.',
    items: [
      { name: 'Alimentação', keywords: ['alimentação', 'alimentacao', 'comida', 'supermercado', 'açougue', 'acougue'] },
      { name: 'Feira', keywords: ['feira', 'hortifruti', 'legumes', 'frutas'] },
      { name: 'Mercado', keywords: ['mercado', 'mercearia', 'compras'] },
      { name: 'Água', keywords: ['água', 'agua', 'sabesp', 'saneamento'] },
      { name: 'Energia elétrica', keywords: ['energia', 'energia elétrica', 'energia eletrica', 'luz', 'enel', 'cemig', 'copel'] },
      { name: 'Gás', keywords: ['gás', 'gas', 'botijão', 'botijao'] },
      { name: 'Aluguel ou financiamento', keywords: ['aluguel', 'financiamento imobiliario', 'financiamento imobiliário', 'moradia', 'parcela casa'] },
      { name: 'Internet', keywords: ['internet', 'wifi', 'wi-fi', 'fibra', 'banda larga'] },
      { name: '4G', keywords: ['4g', 'plano celular', 'dados moveis', 'dados móveis', 'tim', 'vivo', 'claro'] },
      { name: 'Transporte', keywords: ['transporte', 'combustível', 'combustivel', 'gasolina', 'etanol', 'diesel'] },
      { name: 'Passe', keywords: ['passe', 'passagem', 'ônibus', 'onibus', 'metrô', 'metro', 'trem'] },
      { name: 'Medicamentos essenciais', keywords: ['medicamentos', 'medicamento', 'remédio', 'remedio', 'remédios', 'remedios', 'farmácia', 'farmacia'] },
      { name: 'Plano de saúde', keywords: ['plano de saúde', 'plano de saude', 'médico', 'medico', 'clinica', 'consulta'] }
    ]
  },
  compromissos: {
    title: 'Despesas indispensáveis',
    subtitle: 'Contas e compromissos obrigatórios',
    color: '#F59E0B', // amber
    bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Contas, mensalidades e compromissos contratuais ou pessoais recorrentes que não podem deixar de ser pagos.',
    items: [
      { name: 'Empréstimo', keywords: ['empréstimo', 'emprestimo', 'parcela banco', 'banco'] },
      { name: 'Financiamento', keywords: ['financiamento', 'financiamento carro', 'financiamento moto', 'parcela carro'] },
      { name: 'Funerária', keywords: ['funerária', 'funeraria', 'plano funerario', 'jazigo'] },
      { name: 'Prestação celular', keywords: ['prestação celular', 'prestacao celular', 'parcela celular', 'celular parcelado', 'celular sarah', 'celular da sarah', 'sarah', 'prestação', 'prestacao'] },
      { name: 'Condomínio', keywords: ['condomínio', 'condominio'] },
      { name: 'IPTU', keywords: ['iptu', 'imposto casa'] },
      { name: 'IPVA', keywords: ['ipva', 'imposto carro'] },
      { name: 'Seguro', keywords: ['seguro', 'seguro auto', 'seguro vida', 'seguro residencial'] },
      { name: 'Mensalidade escolar', keywords: ['mensalidade escolar', 'escola', 'colégio', 'colegio', 'faculdade', 'curso', 'mensalidade'] },
      { name: 'Pensão alimentícia', keywords: ['pensão alimentícia', 'pensao alimenticia', 'pensão', 'pensao'] },
      { name: 'Dízimo', keywords: ['dízimo', 'dizimo', 'oferta', 'igreja'] },
      { name: 'Cabelo', keywords: ['cabelo', 'barba', 'salão', 'salao', 'barbearia'] },
      { name: 'Assinaturas essenciais', keywords: ['assinatura essencial', 'assinaturas essenciais'] }
    ]
  },
  dispensaveis: {
    title: 'Gastos dispensáveis',
    subtitle: 'Podem ser reduzidos ou eliminados',
    color: '#EC4899', // pink
    bgClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    description: 'Despesas ligadas a lazer, compras de conveniência, desejos pessoais e estilo de vida que podem ser cortados se necessário.',
    items: [
      { name: 'Blusa de frio', keywords: ['blusa de frio', 'blusa', 'frio', 'casaco', 'jaqueta'] },
      { name: 'Roupas', keywords: ['roupas', 'roupa', 'vestuário', 'vestuario', 'camisa', 'camiseta', 'calça', 'calca'] },
      { name: 'Calçados', keywords: ['calçados', 'calcados', 'calçado', 'calcado', 'sapato', 'tênis', 'tenis', 'chinelo'] },
      { name: 'Cartão Nubank (compras parceladas não essenciais)', keywords: ['nubank', 'roxinho', 'cartao nubank', 'cartão nubank'] },
      { name: 'Refrigerante', keywords: ['refrigerante', 'coca', 'coca-cola', 'guaraná', 'guarana', 'fanta', 'suco lata'] },
      { name: 'Restaurantes', keywords: ['restaurante', 'restaurantes', 'jantar', 'almoço fora', 'almoco fora'] },
      { name: 'Delivery', keywords: ['delivery', 'ifood', 'burguer', 'lanche', 'pizza', 'hamburguer'] },
      { name: 'Doces e snacks', keywords: ['doces', 'doce', 'snack', 'snacks', 'chocolate', 'bombom', 'sorvete', 'salgadinho'] },
      { name: 'Uber (quando houver alternativa)', keywords: ['uber', '99', '99táxi', '99taxi', 'corrida'] },
      { name: 'Streaming', keywords: ['streaming', 'netflix', 'spotify', 'prime video', 'disney', 'hbo max', 'deezer'] },
      { name: 'Cosméticos', keywords: ['cosméticos', 'cosmeticos', 'maquiagem', 'perfume', 'creme', 'hidratante'] },
      { name: 'Compras por impulso', keywords: ['impulso', 'compras por impulso', 'promoção', 'promocao'] },
      { name: 'Lazer', keywords: ['lazer', 'cinema', 'shopping', 'show', 'balada', 'festa', 'passeio'] },
      { name: 'Viagens', keywords: ['viagem', 'viagens', 'hotel', 'pousada', 'passagem aerea'] },
      { name: 'Eletrônicos não essenciais', keywords: ['eletrônicos', 'eletronicos', 'gadget', 'celular novo', 'fone bluetooth', 'videogame'] },
      { name: 'Decoração', keywords: ['decoração', 'decoracao', 'enfeite', 'quadro', 'planta', 'vaso'] },
      { name: 'Academia (quando não for necessidade específica)', keywords: ['academia', 'gym', 'crossfit', 'suplemento', 'whey'] }
    ]
  }
};

interface ParsedItem {
  rawLine: string;
  description: string;
  amount: number;
  categoryKey: 'indispensaveis' | 'compromissos' | 'dispensaveis' | 'outros';
  matchedSubcategory: string;
  matchedKeyword: string;
}

export default function Financas({ transactions, onAddTransaction, onDeleteTransaction }: FinancasProps) {
  // Toggle between Prompt mode and classic History list
  const [activeTab, setActiveTab] = useState<'prompt' | 'historico'>('prompt');

  // Input prompt value loaded from localStorage
  const [promptText, setPromptText] = useState<string>(() => {
    return localStorage.getItem('fm_finance_prompt') || '';
  });

  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [showCategoryGuide, setShowCategoryGuide] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Income registration form states
  const [incDesc, setIncDesc] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incomeSuccess, setIncomeSuccess] = useState(false);

  // Parse prompt text deterministically (No AI)
  const parsePrompt = (text: string): ParsedItem[] => {
    const lines = text.split('\n');
    const result: ParsedItem[] = [];

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Extract value from line
      const numberRegex = /(?:R\$|\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:[\.,][0-9]{1,2})?)/g;
      const matches = trimmed.match(numberRegex);
      if (!matches) continue;

      let amount = 0;
      let amountStr = '';

      // Check from the right (usually amount is at the end of the line)
      for (let i = matches.length - 1; i >= 0; i--) {
        let clean = matches[i].replace(/R\$/g, '').replace(/\$/g, '').trim();
        if (clean.includes('/') && clean.split('/').length === 3) continue; // Date fallback
        
        // Handle thousands and decimal separators
        if (clean.includes('.') && clean.includes(',')) {
          clean = clean.replace(/\./g, '').replace(/,/g, '.');
        } else if (clean.includes(',')) {
          if (clean.split(',')[1]?.length === 2) {
            clean = clean.replace(/,/g, '.');
          } else {
            clean = clean.replace(/,/g, '');
          }
        }

        const parsedValue = parseFloat(clean);
        if (!isNaN(parsedValue) && parsedValue > 0) {
          amount = parsedValue;
          amountStr = matches[i];
          break;
        }
      }

      if (amount <= 0) continue;

      const descPart = trimmed.replace(amountStr, '').replace(/R\$/g, '').replace(/[\-:\=]/g, '').trim();
      const description = descPart || 'Gasto sem descrição';
      const lowercaseDesc = description.toLowerCase();

      // Classify deterministically based on categories list
      let matchedCategory: 'indispensaveis' | 'compromissos' | 'dispensaveis' | 'outros' = 'outros';
      let matchedSubcategory = 'Outros / Não categorizados';
      let matchedKeyword = '';

      // Check Indispensáveis (A)
      for (const item of CATEGORIES_CONFIG.indispensaveis.items) {
        for (const kw of item.keywords) {
          if (lowercaseDesc.includes(kw)) {
            matchedCategory = 'indispensaveis';
            matchedSubcategory = item.name;
            matchedKeyword = kw;
            break;
          }
        }
        if (matchedCategory !== 'outros') break;
      }

      // Check Compromissos (B)
      if (matchedCategory === 'outros') {
        for (const item of CATEGORIES_CONFIG.compromissos.items) {
          for (const kw of item.keywords) {
            if (lowercaseDesc.includes(kw)) {
              matchedCategory = 'compromissos';
              matchedSubcategory = item.name;
              matchedKeyword = kw;
              break;
            }
          }
          if (matchedCategory !== 'outros') break;
        }
      }

      // Check Dispensáveis (C)
      if (matchedCategory === 'outros') {
        for (const item of CATEGORIES_CONFIG.dispensaveis.items) {
          for (const kw of item.keywords) {
            if (lowercaseDesc.includes(kw)) {
              matchedCategory = 'dispensaveis';
              matchedSubcategory = item.name;
              matchedKeyword = kw;
              break;
            }
          }
          if (matchedCategory !== 'outros') break;
        }
      }

      result.push({
        rawLine: trimmed,
        description,
        amount,
        categoryKey: matchedCategory,
        matchedSubcategory,
        matchedKeyword
      });
    }

    return result;
  };

  // Run parser on load and prompt update
  useEffect(() => {
    localStorage.setItem('fm_finance_prompt', promptText);
    const parsed = parsePrompt(promptText);
    setParsedItems(parsed);
  }, [promptText]);

  // Aggregate values for the chart
  const indispensaveisTotal = parsedItems
    .filter(item => item.categoryKey === 'indispensaveis')
    .reduce((sum, item) => sum + item.amount, 0);

  const compromissosTotal = parsedItems
    .filter(item => item.categoryKey === 'compromissos')
    .reduce((sum, item) => sum + item.amount, 0);

  const dispensaveisTotal = parsedItems
    .filter(item => item.categoryKey === 'dispensaveis')
    .reduce((sum, item) => sum + item.amount, 0);

  const outrosTotal = parsedItems
    .filter(item => item.categoryKey === 'outros')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSum = indispensaveisTotal + compromissosTotal + dispensaveisTotal + outrosTotal;

  // Real overall history balance
  const totalIncomesSaved = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpensesSaved = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const realBalance = totalIncomesSaved - totalExpensesSaved;

  // Pie chart calculations (Polar coordinates for clean SVG slices)
  const chartData = [
    { key: 'indispensaveis', label: 'Gastos indispensáveis', value: indispensaveisTotal, color: CATEGORIES_CONFIG.indispensaveis.color },
    { key: 'compromissos', label: 'Despesas indispensáveis', value: compromissosTotal, color: CATEGORIES_CONFIG.compromissos.color },
    { key: 'dispensaveis', label: 'Gastos dispensáveis', value: dispensaveisTotal, color: CATEGORIES_CONFIG.dispensaveis.color },
    { key: 'outros', label: 'Outros / Não classificados', value: outrosTotal, color: '#4B5563' }
  ].filter(d => d.value > 0);

  // Render arc segments for custom SVG
  let cumulativePercent = 0;
  const pieSlices = chartData.map((slice) => {
    const percent = slice.value / totalSum;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;

    // Center coordinates & radius
    const cx = 100;
    const cy = 100;
    const r = 70;

    // Polar to Cartesian
    const polarToCart = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    // Calculate arc path
    const start = polarToCart(cx, cy, r, endAngle);
    const end = polarToCart(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const pathData = [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');

    const midAngle = (startAngle + endAngle) / 2;
    const labelPos = polarToCart(cx, cy, r * 0.72, midAngle);

    return {
      ...slice,
      path: pathData,
      percent: percent * 100,
      labelX: labelPos.x,
      labelY: labelPos.y
    };
  });

  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Add Income (Receita) Submit
  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(incAmount.replace(/,/g, '.'));
    if (!incDesc.trim()) {
      alert('Por favor, informe uma descrição da receita.');
      return;
    }
    if (isNaN(val) || val <= 0) {
      alert('Por favor, informe um valor numérico válido maior que zero.');
      return;
    }
    
    onAddTransaction({
      description: incDesc.trim(),
      amount: val,
      type: 'income',
      category: 'Receita',
      date: incDate || new Date().toISOString().split('T')[0]
    });

    setIncDesc('');
    setIncAmount('');
    setIncomeSuccess(true);
    setTimeout(() => setIncomeSuccess(false), 3000);
  };

  // Add parsed items to app-wide cash flow history
  const handleSaveToHistory = () => {
    if (parsedItems.length === 0) return;
    
    // Save each parsed transaction
    parsedItems.forEach((item) => {
      let mappedCat = 'Outros';
      if (item.categoryKey === 'indispensaveis') mappedCat = 'Alimentação';
      else if (item.categoryKey === 'compromissos') mappedCat = 'Serviços';
      else if (item.categoryKey === 'dispensaveis') mappedCat = 'Lazer';

      onAddTransaction({
        description: item.description,
        amount: item.amount,
        type: 'expense',
        category: mappedCat,
        date: new Date().toISOString().split('T')[0]
      });
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Banner Control */}
      <div className="bg-[#161616] border border-[#222222] p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              Gestão Financeira por Prompt <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-[#8E8E8F] font-semibold uppercase tracking-wider">Escreva seus gastos livremente sem IA</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-[#0D0D0D] border border-[#222222] p-1 rounded-xl w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prompt' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Prompt Inteligente
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'historico' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Fluxo de Caixa ({transactions.length})
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Incomes Card */}
        <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Dinheiro Disponível (Receitas)</span>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">{formatBRL(totalIncomesSaved)}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">Total de Despesas Lançadas</span>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">{formatBRL(totalExpensesSaved)}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Saldo Livre (Dinheiro Sobrando)</span>
            <p className={`text-xl sm:text-2xl font-extrabold font-mono ${realBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatBRL(realBalance)}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${realBalance >= 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'prompt' ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left side: Receita Form & Prompt Box (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Income Registration Card */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Cadastrar Nova Receita
                  </h3>
                  <p className="text-[10px] text-[#8E8E8F]">Insira salários, ganhos de freelancers ou outros rendimentos para compor seu saldo disponível</p>
                </div>

                <form onSubmit={handleAddIncomeSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Descrição do Rendimento</label>
                      <input
                        type="text"
                        required
                        value={incDesc}
                        onChange={(e) => setIncDesc(e.target.value)}
                        placeholder="Ex: Salário Mensal, Freelance"
                        className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Valor (R$)</label>
                      <input
                        type="text"
                        required
                        value={incAmount}
                        onChange={(e) => setIncAmount(e.target.value)}
                        placeholder="Ex: 3500.00"
                        className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Data do Recebimento</label>
                      <input
                        type="date"
                        required
                        value={incDate}
                        onChange={(e) => setIncDate(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Confirmar Receita
                      </button>
                    </div>
                  </div>
                </form>

                {incomeSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold py-2 px-3 rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Receita adicionada e salva com sucesso!
                  </motion.div>
                )}
              </div>

              {/* Prompt Box */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222]/30 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Descrever Meus Gastos</h3>
                    <p className="text-[10px] text-[#8E8E8F]">Insira suas contas e gastos diários de forma rápida</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Deseja limpar todo o texto do prompt?")) setPromptText('');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                  >
                    Limpar Texto
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full h-48 bg-[#0D0D0D] border border-[#222222] rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-[#4B5563] resize-none"
                    placeholder="Ex:&#10;Aluguel 1200&#10;Mercado mensal 450&#10;Refrigerante no almoço 12,90&#10;Celular da Sarah 45"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#8E8E8F]">
                    <span>Formatos suportados: "Item 100", "Item: R$ 50,20", "Item - 30 reais"</span>
                    <span className="font-mono text-indigo-400 font-bold">{parsedItems.length} linhas lidas</span>
                  </div>
                </div>

                {/* Import actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSaveToHistory}
                    disabled={parsedItems.length === 0}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Salvar estes Lançamentos no Fluxo de Caixa
                  </button>
                </div>

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold py-2.5 px-4 rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Gastos sincronizados e gravados com sucesso no seu Fluxo de Caixa histórico!
                  </motion.div>
                )}
              </div>

              {/* Parsed List Detail Table */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" /> Resultados do Processamento
                </h3>
                
                {parsedItems.length === 0 ? (
                  <p className="text-xs text-[#8E8E8F] py-4 text-center">Escreva suas despesas acima para visualizar a classificação.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#222222] text-[#8E8E8F] font-bold">
                          <th className="pb-2.5">Item Lido</th>
                          <th className="pb-2.5">Palavra-Chave</th>
                          <th className="pb-2.5">Categoria Associada</th>
                          <th className="pb-2.5 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]/30">
                        {parsedItems.map((item, idx) => {
                          const config = item.categoryKey !== 'outros' ? CATEGORIES_CONFIG[item.categoryKey] : null;
                          return (
                            <tr key={idx} className="hover:bg-[#222222]/10 transition-colors">
                              <td className="py-2.5 font-bold text-white max-w-[150px] truncate">{item.description}</td>
                              <td className="py-2.5">
                                {item.matchedKeyword ? (
                                  <span className="px-1.5 py-0.5 rounded bg-[#222222] text-[#8E8E8F] font-mono text-[10px]">
                                    {item.matchedKeyword}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                              <td className="py-2.5">
                                {config ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bgClass}`}>
                                    {config.title}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                    Não Classificado
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-white">
                                {formatBRL(item.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Chart Analytics (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Pie Chart display block */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col items-center">
                <div className="text-center pb-4 border-b border-[#222222]/30 w-full mb-6">
                  <h3 className="font-extrabold text-sm text-white">Análise de Pizza Categorizada</h3>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Distribuição do orçamento de acordo com o modelo de gastos</p>
                </div>

                {totalSum === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <PieChart className="w-12 h-12 text-[#8E8E8F]/30 mx-auto" />
                    <p className="text-xs text-[#8E8E8F]">Insira valores e itens no prompt para desenhar o gráfico.</p>
                  </div>
                ) : (
                  <div className="space-y-6 w-full flex flex-col items-center">
                    {/* SVG Pie Chart Segment Rendering */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                        {pieSlices.map((slice, idx) => {
                          const isHovered = hoveredSlice === slice.key;
                          return (
                            <path
                              key={idx}
                              d={slice.path}
                              fill={slice.color}
                              className="transition-all duration-300 cursor-pointer hover:opacity-90 hover:scale-105 origin-center"
                              style={{
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' : 'none'
                              }}
                              onMouseEnter={() => setHoveredSlice(slice.key)}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          );
                        })}
                        {/* Donut Hole cutout to write Center Text */}
                        <circle cx="100" cy="100" r="45" fill="#161616" />
                      </svg>

                      {/* Donut Center Label - Display Sum Combined With Percentage */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-3">
                        {hoveredSlice ? (
                          <>
                            <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-wider max-w-[80px] truncate">
                              {hoveredSlice === 'indispensaveis' ? 'Indispensáveis' : hoveredSlice === 'compromissos' ? 'Despesas' : hoveredSlice === 'dispensaveis' ? 'Dispensáveis' : 'Outros'}
                            </span>
                            <span className="text-xs font-extrabold text-white mt-0.5">
                              {formatBRL(chartData.find(d => d.key === hoveredSlice)?.value || 0)}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-gray-400">
                              {(((chartData.find(d => d.key === hoveredSlice)?.value || 0) / totalSum) * 100).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Soma Total</span>
                            <span className="text-sm sm:text-base font-extrabold text-white">{formatBRL(totalSum)}</span>
                            <span className="text-[8px] text-indigo-400 font-bold mt-0.5">Passe o mouse</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Legends detail - Combined Percentage and absolute sum total */}
                    <div className="w-full space-y-2 pt-2 border-t border-[#222222]/30">
                      {chartData.map((slice, idx) => {
                        const percent = (slice.value / totalSum) * 100;
                        const config = slice.key !== 'outros' ? CATEGORIES_CONFIG[slice.key as keyof typeof CATEGORIES_CONFIG] : null;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredSlice(slice.key)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              hoveredSlice === slice.key ? 'bg-[#222222]/30 border-[#444444]' : 'bg-[#0D0D0D]/50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                              <div className="text-left">
                                <p className="text-xs font-bold text-white">{config ? config.title : 'Outros / Diversos'}</p>
                                <p className="text-[9px] text-[#8E8E8F]">
                                  {config ? config.subtitle : 'Sem categoria correspondente'}
                                </p>
                                {/* Percentage with the summed value next to it */}
                                <p className="text-[10px] text-[#818CF8] font-mono font-extrabold mt-0.5">
                                  {percent.toFixed(1)}% ({formatBRL(slice.value)})
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono font-bold text-white">{formatBRL(slice.value)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Explaining Categories (Explicando o que cada categoria considera) */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Configurações e Critérios de Categorização</h3>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Entenda como o motor determina cada categoria com base nas regras fornecidas:</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(CATEGORIES_CONFIG).map(([key, value]) => {
                    const isExpanded = showCategoryGuide === key;
                    return (
                      <div key={key} className="border border-[#222222] rounded-xl overflow-hidden bg-[#0D0D0D]">
                        <button
                          onClick={() => setShowCategoryGuide(isExpanded ? null : key)}
                          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#222222]/15 transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: value.color }} />
                            <div>
                              <p className="text-xs font-bold text-white">{value.title}</p>
                              <p className="text-[10px] text-[#8E8E8F]">{value.subtitle}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[#8E8E8F] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 border-t border-[#222222]/40 pt-3 text-xs text-gray-300 space-y-3 bg-[#111111]/30"
                            >
                              <p className="text-[#8E8E8F] leading-relaxed text-[11px]">{value.description}</p>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Itens e Termos Identificados:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {value.items.map((it, i) => (
                                    <div key={i} className="px-2 py-1 rounded bg-[#161616] border border-[#222222] text-[10px] flex flex-col">
                                      <span className="text-gray-200 font-semibold">{it.name}</span>
                                      <span className="text-[8px] text-indigo-400 font-mono mt-0.5">({it.keywords.join(', ')})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" /> Dica de Organização
                </h4>
                <p className="text-[11px] text-[#8E8E8F] leading-relaxed">
                  Para manter as finanças saudáveis, a recomendação clássica é direcionar cerca de <b>50%</b> para os <b>Gastos indispensáveis</b> (sobrevivência), <b>30%</b> para as <b>Despesas indispensáveis</b> (contas fixas) e até <b>20%</b> para os <b>Gastos dispensáveis</b> (estilo de vida e supérfluos).
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="historico"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Classic flow registers */}
            <div className="lg:col-span-12 bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#222222]/30 pb-4 gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Histórico Geral do Fluxo de Caixa</h3>
                  <p className="text-[11px] text-[#8E8E8F]">Todos os registros financeiros gravados no sistema</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-[#222222] text-[#8E8E8F] px-3 py-1.5 rounded-xl font-mono font-bold">
                    Total: {transactions.length} lançamentos
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                {transactions.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <Wallet className="w-10 h-10 text-[#8E8E8F]/40 mx-auto" />
                    <p className="text-xs text-[#8E8E8F]">Nenhuma transação gravada no fluxo ainda.</p>
                    <p className="text-[10px] text-indigo-400 font-bold">Utilize a aba "Prompt Inteligente" para lançar vários gastos de uma só vez!</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#222222] text-[#8E8E8F] font-bold">
                        <th className="pb-3 pl-3">Descrição do Lançamento</th>
                        <th className="pb-3">Tipo</th>
                        <th className="pb-3">Categoria / Destino</th>
                        <th className="pb-3">Data de Registro</th>
                        <th className="pb-3 text-right pr-3">Valor</th>
                        <th className="pb-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]/30">
                      {[...transactions]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-[#222222]/10 transition-colors">
                            <td className="py-3 pl-3 font-bold text-white">{t.description}</td>
                            <td className="py-3">
                              {t.type === 'income' ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 uppercase tracking-wider">
                                  + Receita
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-950/30 text-rose-400 border border-rose-900/30 uppercase tracking-wider">
                                  - Despesa
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded bg-[#222222] text-[#8E8E8F] text-[10px] font-bold">
                                {t.category}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-[#8E8E8F]">
                              {t.date.split('-').reverse().join('/')}
                            </td>
                            <td className={`py-3 text-right pr-3 font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.type === 'income' ? '+' : '-'} {formatBRL(t.amount)}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => onDeleteTransaction(t.id)}
                                className="p-1.5 hover:bg-red-500/15 hover:text-red-400 rounded-lg text-red-500/70 transition-colors cursor-pointer"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
