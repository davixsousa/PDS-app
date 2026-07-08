import React, { useState } from 'react';
import { Target, Plus, Minus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal } from '../types';

interface MetasProps {
  goals: Goal[];
  onAddGoal: (g: Omit<Goal, 'id' | 'completed'>) => void;
  onUpdateGoalProgress: (id: string, progress: number) => void;
  onToggleGoalCompleted: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onIncrementGoalCount: (id: string, amount: number) => void;
}

export default function Metas({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onToggleGoalCompleted,
  onDeleteGoal,
  onIncrementGoalCount,
}: MetasProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pessoal');
  const [term, setTerm] = useState('Curto Prazo');
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() + 3); // Default to 3 months from now
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [isNumeric, setIsNumeric] = useState(false);
  const [targetCount, setTargetCount] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      targetDate,
      progress: 0,
      term,
      isNumeric,
      currentCount: isNumeric ? 0 : undefined,
      targetCount: isNumeric ? targetCount : undefined,
    });

    setTitle('');
    setDescription('');
    setTerm('Curto Prazo');
    setIsNumeric(false);
    setTargetCount(10);
  };

  const categories = ['Pessoal', 'Carreira', 'Finanças', 'Estudos', 'Saúde', 'Outros'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Goal Form */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div className="border-b border-[#222222]/30 pb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#6366F1]" />
            <div>
              <h3 className="font-bold text-sm text-white">Nova Meta</h3>
              <p className="text-[10px] text-[#8E8E8F]">Planeje seus objetivos estruturados</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#8E8E8F] font-semibold">Título da Meta</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ler 12 livros este ano"
                className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8E8E8F] font-semibold">Descrição (Opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre como planeja alcançar esta meta..."
                rows={2}
                className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] text-white resize-none transition-all"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#8E8E8F] font-semibold">Prazo do Objetivo</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
                >
                  <option value="Curto Prazo">Curto Prazo</option>
                  <option value="Médio Prazo">Médio Prazo</option>
                  <option value="Longo Prazo">Longo Prazo</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#8E8E8F] font-semibold">Data da Realização</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8E8E8F] font-semibold">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8E8E8F] font-semibold">Tipo de Meta</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsNumeric(false)}
                  className={`py-2 px-3 text-xs rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    !isNumeric
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#8E8E8F] hover:text-white hover:border-[#333333]'
                  }`}
                >
                  Checklist Simples
                </button>
                <button
                  type="button"
                  onClick={() => setIsNumeric(true)}
                  className={`py-2 px-3 text-xs rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    isNumeric
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#8E8E8F] hover:text-white hover:border-[#333333]'
                  }`}
                >
                  Meta com Número
                </button>
              </div>
            </div>

            {isNumeric && (
              <div className="space-y-1.5">
                <label className="text-xs text-[#8E8E8F] font-semibold">Quantidade Alvo (ex: 12 livros)</label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 transition-colors py-3 rounded-xl text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> Registrar Meta
            </button>
          </form>

          {/* Educational / Motivational Box */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Dica de Planejamento
            </h4>
            <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
              <strong>1. Metas Numéricas (Contadores):</strong> Excelente para projetos contínuos, como ler X livros ou fazer X treinos. Vá adicionando seu progresso aos poucos (+1, +2, +3) até alcançar os 100%!
            </p>
            <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
              <strong>2. Metas de Checklist:</strong> Ideal para tarefas diretas ou marcos objetivos ("Criar portfólio"). Basta um clique para concluir e liberar aquela dose de dopamina!
            </p>
          </div>
        </div>

        {/* Goals Grid / List */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-5 flex flex-col min-h-[350px]">
          <div className="border-b border-[#222222]/30 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-white">Suas Metas</h3>
              <p className="text-[10px] text-[#8E8E8F]">Acompanhe o andamento dos seus objetivos</p>
            </div>
            <span className="text-[10px] bg-[#222222] text-[#8E8E8F] px-2.5 py-1 rounded-md font-mono font-bold">
              {goals.length} registradas
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {goals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Target className="w-8 h-8 text-[#8E8E8F]/40" />
                <p className="text-xs text-[#8E8E8F]">Nenhuma meta planejada ainda.</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    goal.completed
                      ? 'bg-emerald-950/10 border-emerald-500/25'
                      : 'bg-[#0D0D0D] border-[#222222]/50 hover:border-[#222222]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleGoalCompleted(goal.id)}
                        className={`mt-0.5 flex-shrink-0 transition-colors cursor-pointer ${
                          goal.completed ? 'text-emerald-500' : 'text-[#8E8E8F] hover:text-[#6366F1]'
                        }`}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className={`text-xs font-bold leading-tight ${goal.completed ? 'line-through text-[#8E8E8F]' : 'text-white'}`}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-[10px] text-[#8E8E8F] leading-relaxed line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[9px] text-[#8E8E8F] pt-1 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-[#222222] font-semibold">{goal.category}</span>
                          {goal.term && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                              {goal.term}
                            </span>
                          )}
                          <span>Prazo: {goal.targetDate.split('-').reverse().join('/')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 border border-transparent hover:border-[#222222] hover:bg-[#161616] rounded-lg text-[#8E8E8F] hover:text-red-400 transition-colors cursor-pointer"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress / Checklist control */}
                  <div className="mt-4 pt-3 border-t border-[#222222]/30 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#8E8E8F] font-semibold">
                        {goal.isNumeric ? (
                          <span>
                            Contador: <strong className="text-white font-mono">{goal.currentCount || 0}</strong> de <strong className="text-indigo-400 font-mono">{goal.targetCount}</strong>
                          </span>
                        ) : (
                          <span>Status da Meta</span>
                        )}
                      </span>
                      <span className="font-bold text-white">{goal.progress}%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#161616] h-1.5 rounded-full overflow-hidden border border-[#222222]/50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            goal.completed ? 'bg-emerald-500' : 'bg-[#6366F1]'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>

                      {goal.isNumeric && !goal.completed && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 1)}
                            className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 2)}
                            className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +2"
                          >
                            +2
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 3)}
                            className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +3"
                          >
                            +3
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, -1)}
                            className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#222222] hover:bg-[#333333] border border-[#333333] text-[#8E8E8F] hover:text-white rounded cursor-pointer transition-colors"
                            title="Remover -1"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
