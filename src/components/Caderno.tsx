import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  X,
  FilePlus,
  Book,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
  RotateCcw,
  Undo2,
  Redo2,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  CheckCircle2,
  RefreshCw,
  Save,
  Heading,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Note } from '../types';

interface CadernoProps {
  subjects: Subject[];
  notes: Note[];
  selectedSubjectId: string | null;
  onAddSubject: (name: string) => void;
  onRenameSubject: (id: string, newName: string) => void;
  onDeleteSubject: (id: string) => void;
  onSelectSubject: (id: string | null) => void;
  onAddNote: (subjectId: string, title: string, content: string) => void;
  onUpdateNote: (id: string, title: string, content: string, silent?: boolean) => void;
  onDeleteNote: (id: string) => void;
}

export default function Caderno({
  subjects,
  notes,
  selectedSubjectId,
  onAddSubject,
  onRenameSubject,
  onDeleteSubject,
  onSelectSubject,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: CadernoProps) {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);

  // Active note state for inputs
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Mini picker states
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  // Active note lookup
  const activeNote = notes.find((n) => n.id === selectedNoteId);

  // Synchronize state ONLY when selectedNoteId changes to prevent cursor jumping
  useEffect(() => {
    isInitialLoadRef.current = true;
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      if (contentRef.current) {
        contentRef.current.innerHTML = activeNote.content;
      }
      setSaveStatus('saved');
    } else {
      setEditorTitle('');
      setEditorContent('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
      setSaveStatus('saved');
    }
    setShowTextColorPicker(false);
    setShowHighlightColorPicker(false);
    setShowDeleteNoteConfirm(false);
  }, [selectedNoteId]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!selectedNoteId) return;

    // Skip auto-save on initial note load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    setSaveStatus('unsaved');
    let doneTimer: NodeJS.Timeout;

    const timer = setTimeout(() => {
      setSaveStatus('saving');
      onUpdateNote(selectedNoteId, editorTitle.trim() || 'Sem título', editorContent, true);
      
      doneTimer = setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    }, 3000); // 3s idle delay (typing pause)

    return () => {
      clearTimeout(timer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [editorTitle, editorContent, selectedNoteId, onUpdateNote]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim());
    setNewSubjectName('');
  };

  const handleAddNote = () => {
    if (!selectedSubjectId) return;
    const initialTitle = 'Nova Nota';
    const initialContent = '<div>Comece a digitar aqui...</div>';
    onAddNote(selectedSubjectId, initialTitle, initialContent);
  };

  // Auto-select the first note of selected subject if none is selected
  useEffect(() => {
    if (selectedSubjectId) {
      const filtered = notes.filter((n) => n.subjectId === selectedSubjectId);
      if (filtered.length > 0) {
        if (!selectedNoteId) {
          setSelectedNoteId(filtered[0].id);
        }
      } else {
        setSelectedNoteId(null);
      }
    } else {
      setSelectedNoteId(null);
    }
  }, [selectedSubjectId, notes, selectedNoteId]);

  const handleSaveActiveNote = () => {
    if (!selectedNoteId) return;
    const updatedHtml = contentRef.current ? contentRef.current.innerHTML : editorContent;
    onUpdateNote(selectedNoteId, editorTitle.trim() || 'Sem título', updatedHtml, false);
    setSaveStatus('saved');
  };

  const handleDeleteActiveNote = () => {
    if (!selectedNoteId) return;
    if (confirm('Deseja realmente excluir esta nota?')) {
      onDeleteNote(selectedNoteId);
      setSelectedNoteId(null);
    }
  };

  // Unified command execution with selection protection
  const execEditorCommand = (command: string, value: string | undefined = undefined) => {
    try {
      document.execCommand(command, false, value);
      if (contentRef.current) {
        setEditorContent(contentRef.current.innerHTML);
      }
    } catch (err) {
      console.warn('execCommand failed:', err);
    }
  };

  const handleFormatClick = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
    e.preventDefault(); // Crucial: prevents editable area from losing text selection focus
    execEditorCommand(command, value);
  };

  const textColors = [
    { name: 'Padrão', hex: '#FFFFFF' },
    { name: 'Cinza', hex: '#9CA3AF' },
    { name: 'Índigo', hex: '#818CF8' },
    { name: 'Esmeralda', hex: '#34D399' },
    { name: 'Amarelo', hex: '#FBBF24' },
    { name: 'Carmesim', hex: '#F87171' },
    { name: 'Ciano', hex: '#22D3EE' },
  ];

  const highlightColors = [
    { name: 'Nenhum', hex: 'transparent' },
    { name: 'Roxo', hex: 'rgba(99, 102, 241, 0.45)' },
    { name: 'Verde', hex: 'rgba(16, 185, 129, 0.45)' },
    { name: 'Amarelo', hex: 'rgba(245, 158, 11, 0.45)' },
    { name: 'Vermelho', hex: 'rgba(239, 68, 68, 0.45)' },
    { name: 'Azul', hex: 'rgba(59, 130, 246, 0.45)' },
  ];

  const filteredNotes = notes.filter((n) => n.subjectId === selectedSubjectId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[650px] overflow-hidden">
        
        {/* Left Column: Subjects and notes list */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-4 flex flex-col h-full space-y-4 overflow-y-auto shadow-sm">
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E8F] flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-[#6366F1]" /> Matérias
            </h4>
            
            <form onSubmit={handleAddSubject} className="flex gap-1.5">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Nova matéria..."
                className="flex-1 bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] min-w-0 transition-all"
              />
              <button
                type="submit"
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 px-3 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

          {/* Subjects Container */}
          <div className="space-y-1">
            <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {subjects.length === 0 ? (
                <p className="text-xs text-[#8E8E8F] p-2 text-center md:text-left w-full">Crie uma matéria para começar.</p>
              ) : (
                subjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  const isEditing = editingSubjectId === sub.id;
                  const isDeleting = deletingSubjectId === sub.id;

                  if (isEditing) {
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center gap-1.5 p-1 bg-[#1A1A1A] border border-[#333333] rounded-xl text-xs w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingSubjectName}
                          onChange={(e) => setEditingSubjectName(e.target.value)}
                          className="flex-1 bg-[#0D0D0D] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#6366F1] min-w-0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingSubjectName.trim()) {
                                onRenameSubject(sub.id, editingSubjectName.trim());
                              }
                              setEditingSubjectId(null);
                            } else if (e.key === 'Escape') {
                              setEditingSubjectId(null);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingSubjectName.trim()) {
                              onRenameSubject(sub.id, editingSubjectName.trim());
                            }
                            setEditingSubjectId(null);
                          }}
                          className="p-1 hover:bg-[#222222] text-emerald-400 rounded-lg cursor-pointer flex items-center justify-center"
                          title="Salvar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubjectId(null);
                          }}
                          className="p-1 hover:bg-[#222222] text-red-400 rounded-lg cursor-pointer flex items-center justify-center"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (isDeleting) {
                    return (
                      <div
                        key={sub.id}
                        className="flex flex-col gap-1.5 p-2 bg-red-950/20 border border-red-900/30 rounded-xl text-[10px] w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-red-400 font-bold leading-tight">Excluir matéria e todas as notas?</span>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSubject(sub.id);
                              setDeletingSubjectId(null);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg font-bold cursor-pointer text-[10px]"
                          >
                            Sim
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingSubjectId(null);
                            }}
                            className="bg-[#222222] hover:bg-[#333333] text-[#8E8E8F] hover:text-white px-2 py-1 rounded-lg font-semibold cursor-pointer text-[10px]"
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubject(sub.id)}
                      className={`flex items-center justify-between group px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex-shrink-0 md:flex-shrink ${
                        isSelected
                          ? 'bg-[#6366F1] text-white'
                          : 'text-[#8E8E8F] hover:text-white hover:bg-[#222222]/50 bg-[#0D0D0D]/60 border border-[#222222]/30 md:border-0'
                      }`}
                    >
                      <span className="truncate flex-1 py-0.5 pr-1">{sub.name}</span>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubjectId(sub.id);
                            setEditingSubjectName(sub.name);
                            setDeletingSubjectId(null);
                          }}
                          className="p-1 hover:bg-[#222222]/20 rounded-lg text-inherit transition-colors flex items-center justify-center cursor-pointer"
                          title="Renomear"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSubjectId(sub.id);
                            setEditingSubjectId(null);
                          }}
                          className="p-1 hover:bg-[#222222]/20 rounded-lg text-inherit transition-colors flex items-center justify-center cursor-pointer"
                          title="Excluir"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <hr className="border-[#222222]/40 my-1" />

          {/* Notes list */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E8F]">Notas</h4>
              {selectedSubjectId && (
                <button
                  onClick={handleAddNote}
                  className="text-[#6366F1] hover:text-[#6366F1]/80 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" /> Criar Nota
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {!selectedSubjectId ? (
                <div className="text-center py-8 text-[#8E8E8F] text-xs">
                  Selecione uma matéria acima para carregar suas notas.
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-[#8E8E8F] text-xs">
                  Nenhuma nota criada nesta matéria ainda.
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isNoteSelected = selectedNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                        isNoteSelected
                          ? 'bg-[#6366F1]/10 border-[#6366F1] text-white'
                          : 'bg-[#0D0D0D] border-[#222222]/50 text-[#8E8E8F] hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs truncate w-full">{note.title}</span>
                      <span className="text-[9px] text-[#8E8E8F]">Atualizado: {note.updatedAt}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: High-End Text Editor */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 flex flex-col h-full space-y-4 shadow-sm relative">
          {!selectedNoteId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-[#222222]/50 flex items-center justify-center text-[#8E8E8F]">
                <Book className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nenhuma nota selecionada</p>
                <p className="text-xs text-[#8E8E8F]">Selecione ou crie uma nota no menu lateral para iniciar a digitação.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-3 h-full min-h-0">
              
              {/* Note Header / Meta controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222]/30 pb-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Sem título"
                    className="bg-transparent text-base md:text-lg font-bold text-white focus:outline-none min-w-0 w-full border-b border-transparent focus:border-[#222222]/40 transition-all"
                  />
                  
                  {/* Google Docs-like dynamic auto-save status indicator */}
                  <div className="flex items-center gap-1.5 mt-1 select-none">
                    {saveStatus === 'saving' ? (
                      <>
                        <RefreshCw className="w-3 h-3 text-[#6366F1] animate-spin" />
                        <span className="text-[9px] text-[#6366F1] font-semibold uppercase tracking-wider">Salvando...</span>
                      </>
                    ) : saveStatus === 'unsaved' ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E8F] animate-pulse" />
                        <span className="text-[9px] text-[#8E8E8F] font-semibold uppercase tracking-wider">Alterações não salvas</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider">Salvo no dispositivo</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                  {showDeleteNoteConfirm ? (
                    <div className="flex items-center gap-1 bg-red-950/20 border border-red-900/30 rounded-xl p-1">
                      <span className="text-[9px] text-red-400 font-bold px-1.5 uppercase tracking-wider">Excluir nota?</span>
                      <button
                        onClick={() => {
                          onDeleteNote(selectedNoteId);
                          setSelectedNoteId(null);
                          setShowDeleteNoteConfirm(false);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setShowDeleteNoteConfirm(false)}
                        className="bg-[#222222] hover:bg-[#333333] text-[#8E8E8F] hover:text-white px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveActiveNote}
                        className="bg-[#6366F1] hover:bg-[#6366F1]/90 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#6366F1]/10"
                        title="Forçar salvamento agora"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar
                      </button>
                      <button
                        onClick={() => setShowDeleteNoteConfirm(true)}
                        className="p-2 hover:bg-red-950/20 border border-[#222222] hover:border-red-900/30 rounded-xl text-[#8E8E8F] hover:text-red-400 transition-colors cursor-pointer"
                        title="Excluir Nota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-col gap-1.5 bg-[#0D0D0D] p-1.5 border border-[#222222] rounded-xl flex-shrink-0">
                <div className="flex flex-wrap items-center gap-1">
                  
                  {/* Undo & Redo */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'undo')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Desfazer (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'redo')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Refazer (Ctrl+Y)"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-[#222222] mx-1"></div>

                  {/* Character Styles */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'bold')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Negrito (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'italic')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Itálico (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'underline')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Sublinhado (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'strikeThrough')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Tachado"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-[#222222] mx-1"></div>

                  {/* Document Headings */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'formatBlock', '<h1>')}
                    className="px-2 py-1 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white text-[10px] font-black cursor-pointer flex items-center gap-0.5"
                    title="Título 1"
                  >
                    <Heading className="w-3 h-3 text-[#6366F1]" />1
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'formatBlock', '<h2>')}
                    className="px-2 py-1 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                    title="Título 2"
                  >
                    <Heading className="w-3 h-3 text-[#818CF8]" />2
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'formatBlock', '<p>')}
                    className="px-2 py-1 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white text-[10px] font-semibold cursor-pointer"
                    title="Texto Normal"
                  >
                    Texto
                  </button>

                  <div className="w-[1px] h-4 bg-[#222222] mx-1"></div>

                  {/* Alignment */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'justifyLeft')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Alinhar à Esquerda"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'justifyCenter')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Centralizar"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'justifyRight')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Alinhar à Direita"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'justifyFull')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Justificar"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-[#222222] mx-1"></div>

                  {/* Lists */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'insertUnorderedList')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Lista com Marcadores"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'insertOrderedList')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Lista Numerada"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-[#222222] mx-1"></div>

                  {/* Color Selectors */}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowTextColorPicker(!showTextColorPicker);
                      setShowHighlightColorPicker(false);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showTextColorPicker ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'text-[#8E8E8F] hover:text-white hover:bg-[#222222]'}`}
                    title="Cor da Fonte"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowHighlightColorPicker(!showHighlightColorPicker);
                      setShowTextColorPicker(false);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showHighlightColorPicker ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'text-[#8E8E8F] hover:text-white hover:bg-[#222222]'}`}
                    title="Cor de Realce"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>

                  {/* Clear formatting */}
                  <button
                    onMouseDown={(e) => handleFormatClick(e, 'removeFormat')}
                    className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                    title="Limpar Formatação"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub-toolbar text color selector */}
                <AnimatePresence>
                  {showTextColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 px-1 pb-1 pt-1.5 border-t border-[#222222]/50 flex-wrap overflow-hidden"
                    >
                      <span className="text-[10px] text-[#8E8E8F] font-semibold mr-1.5">Cor do texto:</span>
                      {textColors.map((col) => (
                        <button
                          key={col.hex}
                          onMouseDown={(e) => handleFormatClick(e, 'foreColor', col.hex)}
                          className="w-4 h-4 rounded-full border border-[#222222] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        ></button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sub-toolbar highlight color selector */}
                <AnimatePresence>
                  {showHighlightColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 px-1 pb-1 pt-1.5 border-t border-[#222222]/50 flex-wrap overflow-hidden"
                    >
                      <span className="text-[10px] text-[#8E8E8F] font-semibold mr-1.5">Cor de realce:</span>
                      {highlightColors.map((col) => (
                        <button
                          key={col.hex}
                          onMouseDown={(e) => handleFormatClick(e, 'hiliteColor', col.hex)}
                          className={`w-4 h-4 rounded-full border border-[#222222] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform ${col.hex === 'transparent' ? 'relative bg-[#222222]' : ''}`}
                          style={col.hex !== 'transparent' ? { backgroundColor: col.hex } : undefined}
                          title={col.name}
                        >
                          {col.hex === 'transparent' && (
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-red-500 font-bold">/</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Editable area */}
              <div
                ref={contentRef}
                onInput={() => {
                  if (contentRef.current) {
                    setEditorContent(contentRef.current.innerHTML);
                  }
                }}
                className="flex-1 overflow-y-auto bg-[#0D0D0D] border border-[#222222] rounded-xl p-5 text-sm text-white focus:outline-none leading-relaxed select-text min-h-[150px] outline-none document-editor"
                contentEditable="true"
                placeholder="Comece a escrever sua nota aqui..."
              ></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
