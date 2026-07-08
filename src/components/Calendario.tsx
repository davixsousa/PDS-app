import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, StickyNote, LayoutGrid, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarAnnotation } from '../types';

interface CalendarioProps {
  annotations: CalendarAnnotation[];
  onAddAnnotation: (date: string, text: string) => void;
  onEditAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function Calendario({
  annotations,
  onAddAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
}: CalendarioProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateKey(today);
  });
  const [noteText, setNoteText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Helper date conversions
  function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDisplayFormattedDate(dateKey: string) {
    if (!dateKey) return '';
    const [y, m, d] = dateKey.split('-');
    return `${d}/${m}/${y}`;
  }

  function parseDateKey(dateKey: string) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    const dateObj = parseDateKey(dateKey);
    // Sync current displayed month if user clicks surrounding month date
    if (dateObj.getMonth() !== currentDate.getMonth() || dateObj.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }
  };

  const handleSave = () => {
    if (!noteText.trim()) return;
    if (editingId) {
      onEditAnnotation(editingId, noteText.trim());
      setEditingId(null);
    } else {
      onAddAnnotation(selectedDate, noteText.trim());
    }
    setNoteText('');
  };

  const handleStartEdit = (note: CalendarAnnotation) => {
    setEditingId(note.id);
    setNoteText(note.text);
    setSelectedDate(note.date);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNoteText('');
  };

  // Grid math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthsNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; dateKey: string; isSibling: boolean; isToday: boolean }[] = [];
  const todayKey = formatDateKey(new Date());

  // Previous month padding cells
  for (let i = firstDayOfWeek; i > 0; i--) {
    const dayNum = daysInPrevMonth - i + 1;
    const prevDate = new Date(year, month - 1, dayNum);
    const key = formatDateKey(prevDate);
    cells.push({
      day: dayNum,
      dateKey: key,
      isSibling: true,
      isToday: key === todayKey,
    });
  }

  // Active month cells
  for (let i = 1; i <= daysInMonth; i++) {
    const key = formatDateKey(new Date(year, month, i));
    cells.push({
      day: i,
      dateKey: key,
      isSibling: false,
      isToday: key === todayKey,
    });
  }

  // Next month padding cells
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const key = formatDateKey(nextDate);
    cells.push({
      day: i,
      dateKey: key,
      isSibling: true,
      isToday: key === todayKey,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Box */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#222222] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm tracking-tight text-white">
              {monthsNames[month]} de {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-[#222222] rounded-lg transition-colors text-[#8E8E8F] hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-[#222222] rounded-lg transition-colors text-[#8E8E8F] hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#8E8E8F] border-b border-[#222222]/30 pb-2">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {cells.map((cell, idx) => {
              const isSelected = cell.dateKey === selectedDate;
              const hasAnn = annotations.some((a) => a.date === cell.dateKey);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDate(cell.dateKey)}
                  className={`relative p-2 rounded-xl flex flex-col items-center justify-center aspect-square transition-all cursor-pointer ${
                    cell.isSibling
                      ? 'text-[#8E8E8F]/30 hover:bg-[#222222]/20'
                      : 'text-white hover:bg-[#222222]'
                  } ${
                    isSelected
                      ? 'border border-[#6366F1]/60 bg-[#6366F1]/10 text-white'
                      : ''
                  } ${
                    cell.isToday
                      ? 'bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/30'
                      : ''
                  }`}
                >
                  <span>{cell.day}</span>
                  {hasAnn && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        cell.isToday ? 'bg-white' : 'bg-[#6366F1]'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input annotation box */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#222222]/50">
              <StickyNote className="w-4 h-4 text-[#6366F1]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#8E8E8F]">
                {editingId ? 'Editar Anotação' : 'Nova Anotação'}
              </h4>
            </div>
            
            <div className="text-xs text-white font-medium">
              Data selecionada: <span className="font-bold text-[#6366F1]">{getDisplayFormattedDate(selectedDate)}</span>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              placeholder="Digite sua anotação aqui..."
              className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] text-white resize-none transition-all"
            ></textarea>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#6366F1] hover:bg-[#6366F1]/90 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {editingId ? 'Salvar Edição' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="bg-[#222222] hover:bg-[#222222]/80 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Annotation timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-2">
          <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#6366F1]" />
            Linha do Tempo de Anotações (<span>{annotations.length}</span>)
          </h4>
        </div>

        {annotations.length === 0 ? (
          <div className="text-center p-8 bg-[#161616]/30 border border-[#222222]/50 rounded-2xl">
            <p className="text-xs text-[#8E8E8F]">Nenhuma anotação registrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...annotations]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((note) => (
                <div
                  key={note.id}
                  className="bg-[#161616] border border-[#222222] p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-[#6366F1]/40 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#6366F1] bg-[#6366F1]/10 px-2.5 py-1 rounded-md">
                        {getDisplayFormattedDate(note.date)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAnnotation(note.id)}
                          className="p-1.5 bg-[#0D0D0D] hover:bg-red-950/20 border border-[#222222] rounded-lg text-[#8E8E8F] hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
