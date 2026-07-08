import React, { useState, useEffect, useRef } from 'react';
import { Book, ChevronLeft, ChevronRight, Highlighter, Copy, Plus, Trash2, FileText, Check, Sparkles, Download, Printer, Search, Bold, Italic, Underline, List, Type, Palette, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Books metadata
const BOOKS = [
  // Antigo Testamento
  { id: 'genesis', name: 'Gênesis', chapters: 50, testament: 'old' },
  { id: 'exodo', name: 'Êxodo', chapters: 40, testament: 'old' },
  { id: 'levitico', name: 'Levítico', chapters: 27, testament: 'old' },
  { id: 'numeros', name: 'Números', chapters: 36, testament: 'old' },
  { id: 'deuteronomio', name: 'Deuteronômio', chapters: 34, testament: 'old' },
  { id: 'josue', name: 'Josué', chapters: 24, testament: 'old' },
  { id: 'juizes', name: 'Juízes', chapters: 21, testament: 'old' },
  { id: 'rute', name: 'Rute', chapters: 4, testament: 'old' },
  { id: '1samuel', name: '1 Samuel', chapters: 31, testament: 'old' },
  { id: '2samuel', name: '2 Samuel', chapters: 24, testament: 'old' },
  { id: '1reis', name: '1 Reis', chapters: 22, testament: 'old' },
  { id: '2reis', name: '2 Reis', chapters: 25, testament: 'old' },
  { id: '1cronicas', name: '1 Crônicas', chapters: 29, testament: 'old' },
  { id: '2cronicas', name: '2 Crônicas', chapters: 36, testament: 'old' },
  { id: 'esdras', name: 'Esdras', chapters: 10, testament: 'old' },
  { id: 'neemias', name: 'Neemias', chapters: 13, testament: 'old' },
  { id: 'ester', name: 'Ester', chapters: 10, testament: 'old' },
  { id: 'jo', name: 'Jó', chapters: 42, testament: 'old' },
  { id: 'salmos', name: 'Salmos', chapters: 150, testament: 'old' },
  { id: 'proverbios', name: 'Provérbios', chapters: 31, testament: 'old' },
  { id: 'eclesiastes', name: 'Eclesiastes', chapters: 12, testament: 'old' },
  { id: 'canticos', name: 'Cânticos', chapters: 8, testament: 'old' },
  { id: 'isaias', name: 'Isaías', chapters: 66, testament: 'old' },
  { id: 'jeremias', name: 'Jeremias', chapters: 52, testament: 'old' },
  { id: 'lamentacoes', name: 'Lamentações', chapters: 5, testament: 'old' },
  { id: 'ezequiel', name: 'Ezequiel', chapters: 48, testament: 'old' },
  { id: 'daniel', name: 'Daniel', chapters: 12, testament: 'old' },
  { id: 'oseias', name: 'Oséias', chapters: 14, testament: 'old' },
  { id: 'joel', name: 'Joel', chapters: 3, testament: 'old' },
  { id: 'amos', name: 'Amós', chapters: 9, testament: 'old' },
  { id: 'obadias', name: 'Obadias', chapters: 1, testament: 'old' },
  { id: 'jonas', name: 'Jonas', chapters: 4, testament: 'old' },
  { id: 'miqueias', name: 'Miqueias', chapters: 7, testament: 'old' },
  { id: 'naum', name: 'Naum', chapters: 3, testament: 'old' },
  { id: 'habacuque', name: 'Habacuque', chapters: 3, testament: 'old' },
  { id: 'sofonias', name: 'Sofonias', chapters: 3, testament: 'old' },
  { id: 'ageu', name: 'Ageu', chapters: 2, testament: 'old' },
  { id: 'zacarias', name: 'Zacarias', chapters: 14, testament: 'old' },
  { id: 'malaquias', name: 'Malaquias', chapters: 4, testament: 'old' },

  // Novo Testamento
  { id: 'mateus', name: 'Mateus', chapters: 28, testament: 'new' },
  { id: 'marcos', name: 'Marcos', chapters: 16, testament: 'new' },
  { id: 'lucas', name: 'Lucas', chapters: 24, testament: 'new' },
  { id: 'joao', name: 'João', chapters: 21, testament: 'new' },
  { id: 'atos', name: 'Atos', chapters: 28, testament: 'new' },
  { id: 'romanos', name: 'Romanos', chapters: 16, testament: 'new' },
  { id: '1corintios', name: '1 Coríntios', chapters: 16, testament: 'new' },
  { id: '2corintios', name: '2 Coríntios', chapters: 13, testament: 'new' },
  { id: 'galatas', name: 'Gálatas', chapters: 6, testament: 'new' },
  { id: 'efesios', name: 'Efésios', chapters: 6, testament: 'new' },
  { id: 'filipenses', name: 'Filipenses', chapters: 4, testament: 'new' },
  { id: 'colossenses', name: 'Colossenses', chapters: 4, testament: 'new' },
  { id: '1tessalonicenses', name: '1 Tessalonicenses', chapters: 5, testament: 'new' },
  { id: '2tessalonicenses', name: '2 Tessalonicenses', chapters: 3, testament: 'new' },
  { id: '1timoteo', name: '1 Timóteo', chapters: 6, testament: 'new' },
  { id: '2timoteo', name: '2 Timóteo', chapters: 4, testament: 'new' },
  { id: 'tito', name: 'Tito', chapters: 3, testament: 'new' },
  { id: 'filemom', name: 'Filemom', chapters: 1, testament: 'new' },
  { id: 'hebreus', name: 'Hebreus', chapters: 13, testament: 'new' },
  { id: 'tiago', name: 'Tiago', chapters: 5, testament: 'new' },
  { id: '1pedro', name: '1 Pedro', chapters: 5, testament: 'new' },
  { id: '2pedro', name: '2 Pedro', chapters: 3, testament: 'new' },
  { id: '1joao', name: '1 João', chapters: 5, testament: 'new' },
  { id: '2joao', name: '2 João', chapters: 1, testament: 'new' },
  { id: '3joao', name: '3 João', chapters: 1, testament: 'new' },
  { id: 'judas', name: 'Judas', chapters: 1, testament: 'new' },
  { id: 'apocalipse', name: 'Apocalipse', chapters: 22, testament: 'new' }
];

interface Verse {
  number: number;
  text: string;
}

interface BibleNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface Highlight {
  id: string; // bookId_chapter_verseNumber
  color: string;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Amarelo', bg: 'bg-yellow-500/30 text-yellow-200 border-b border-yellow-400/50', iconColor: 'text-yellow-400' },
  { id: 'green', name: 'Verde', bg: 'bg-green-500/30 text-green-200 border-b border-green-400/50', iconColor: 'text-green-400' },
  { id: 'blue', name: 'Azul', bg: 'bg-blue-500/30 text-blue-200 border-b border-blue-400/50', iconColor: 'text-blue-400' },
  { id: 'purple', name: 'Roxo', bg: 'bg-purple-500/30 text-purple-200 border-b border-purple-400/50', iconColor: 'text-purple-400' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-500/30 text-pink-200 border-b border-pink-400/50', iconColor: 'text-pink-400' },
];

export default function Biblia() {
  // Bible selection state
  const [version, setVersion] = useState<'NVI' | 'NTLH'>(() => {
    return (localStorage.getItem('fm_bible_version') as 'NVI' | 'NTLH') || 'NVI';
  });
  const [selectedBook, setSelectedBook] = useState(BOOKS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filter for books
  const [bookSearch, setBookSearch] = useState('');

  // Selected verse for option overlay
  const [activeVerseNum, setActiveVerseNum] = useState<number | null>(null);

  // Highlighting state (persistent)
  const [highlights, setHighlights] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('fm_bible_highlights');
    return saved ? JSON.parse(saved) : {};
  });

  // Docs notepad state (persistent)
  const [notes, setNotes] = useState<BibleNote[]>(() => {
    const saved = localStorage.getItem('fm_bible_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return localStorage.getItem('fm_bible_active_note_id') || '';
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync states
  useEffect(() => {
    localStorage.setItem('fm_bible_version', version);
  }, [version]);

  useEffect(() => {
    localStorage.setItem('fm_bible_highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('fm_bible_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('fm_bible_active_note_id', activeNoteId);
  }, [activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0] || null;

  // Sync editor content when switching notes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content;
    }
  }, [activeNoteId]);

  // Load Bible Chapter verses
  const loadChapter = async (bookName: string, chapNum: number, currentVer: 'NVI' | 'NTLH') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bible?book=${encodeURIComponent(bookName)}&chapter=${chapNum}&version=${currentVer}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar versículos.');
      }
      const data = await response.json();
      if (data.verses && data.verses.length > 0) {
        setVerses(data.verses);
      } else {
        // Fallback mockup text if API has issues (unlikely, but safe)
        setVerses([
          { number: 1, text: "No princípio criou Deus os céus e a terra." },
          { number: 2, text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível conectar ao servidor de Bíblia. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapter(selectedBook.name, selectedChapter, version);
    setActiveVerseNum(null);
  }, [selectedBook, selectedChapter, version]);

  // Navigate chapters
  const nextChapter = () => {
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(prev => prev + 1);
    } else {
      const currentIdx = BOOKS.findIndex(b => b.id === selectedBook.id);
      if (currentIdx < BOOKS.length - 1) {
        setSelectedBook(BOOKS[currentIdx + 1]);
        setSelectedChapter(1);
      }
    }
  };

  const prevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else {
      const currentIdx = BOOKS.findIndex(b => b.id === selectedBook.id);
      if (currentIdx > 0) {
        setSelectedBook(BOOKS[currentIdx - 1]);
        setSelectedChapter(BOOKS[currentIdx - 1].chapters);
      }
    }
  };

  // Highlights verses
  const highlightVerse = (verseNum: number, colorId: string | null) => {
    const key = `${selectedBook.id}_${selectedChapter}_${verseNum}`;
    setHighlights(prev => {
      const next = { ...prev };
      if (colorId === null) {
        delete next[key];
      } else {
        next[key] = colorId;
      }
      return next;
    });
    setActiveVerseNum(null);
  };

  // Rich Text editor functions (Docs features)
  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    saveEditorContent();
  };

  const saveEditorContent = () => {
    if (editorRef.current && activeNote) {
      const html = editorRef.current.innerHTML;
      setNotes(prev => prev.map(n => n.id === activeNoteId ? {
        ...n,
        content: html,
        updatedAt: new Date().toLocaleDateString('pt-BR')
      } : n));
    }
  };

  // Add Verse to Notes editor
  const appendVerseToNote = (verse: Verse) => {
    if (editorRef.current && activeNote) {
      const citation = `<b>(${selectedBook.name} ${selectedChapter}:${verse.number} ${version})</b>`;
      const verseHtml = `<blockquote style="border-left: 3px solid #6366F1; padding-left: 12px; margin: 8px 0; color: #a1a1aa; font-style: italic;">"${verse.text}" ${citation}</blockquote><p><br></p>`;
      
      editorRef.current.focus();
      
      // Append to the end of editor or insert at selection if possible
      document.execCommand('insertHTML', false, verseHtml);
      saveEditorContent();
      setActiveVerseNum(null);
    }
  };

  // Copy Verse to clipboard
  const copyVerseToClipboard = (verse: Verse) => {
    const fullText = `"${verse.text}" - ${selectedBook.name} ${selectedChapter}:${verse.number} (${version})`;
    navigator.clipboard.writeText(fullText);
    setActiveVerseNum(null);
  };

  // Notebook management
  const createNote = () => {
    const newId = `note_${Date.now()}`;
    const newNote: BibleNote = {
      id: newId,
      title: 'Novo Estudo',
      content: '<h2><b>Título do Estudo</b></h2><p>Escreva suas anotações aqui...</p>',
      updatedAt: new Date().toLocaleDateString('pt-BR'),
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNoteId(newId);
  };

  const deleteNote = (id: string) => {
    if (notes.length <= 1) return;
    const nextList = notes.filter(n => n.id !== id);
    setNotes(nextList);
    if (activeNoteId === id) {
      setActiveNoteId(nextList[0].id);
    }
  };

  const renameNote = (id: string, newTitle: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
  };

  const filteredBooks = BOOKS.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Bible Bar Controls */}
      <div className="bg-[#161616] border border-[#222222] p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Bíblia Sagrada Cristã <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-[#8E8E8F] font-semibold">LEITURA E ESTUDOS SEM HERESIAS</p>
          </div>
        </div>

        {/* Translation Version Select NVI / NTLH */}
        <div className="flex items-center gap-2 bg-[#0D0D0D] border border-[#222222] p-1 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setVersion('NVI')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              version === 'NVI'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            NVI (Nova Versão Internacional)
          </button>
          <button
            onClick={() => setVersion('NTLH')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              version === 'NTLH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            NTLH (Linguagem de Hoje)
          </button>
        </div>
      </div>

      {/* Grid Layout: Bible Viewer (Left) & Google Docs Notes Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Bible Reader (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#161616] border border-[#222222] rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-sm">
            
            {/* Bible Header Picker */}
            <div className="p-4 border-b border-[#222222]/50 flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#161616]">
              {/* Searchable dropdown trigger */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative group flex-1 sm:flex-none">
                  <select
                    value={selectedBook.id}
                    onChange={(e) => {
                      const book = BOOKS.find(b => b.id === e.target.value);
                      if (book) {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                      }
                    }}
                    className="w-full sm:w-44 bg-[#0D0D0D] border border-[#222222] hover:border-indigo-500/50 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors focus:outline-none"
                  >
                    <optgroup label="Antigo Testamento" className="bg-[#0D0D0D] text-gray-400">
                      {BOOKS.filter(b => b.testament === 'old').map(b => (
                        <option key={b.id} value={b.id} className="text-white bg-[#0D0D0D]">{b.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Novo Testamento" className="bg-[#0D0D0D] text-gray-400">
                      {BOOKS.filter(b => b.testament === 'new').map(b => (
                        <option key={b.id} value={b.id} className="text-white bg-[#0D0D0D]">{b.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Chapter Select */}
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="bg-[#0D0D0D] border border-[#222222] hover:border-indigo-500/50 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors focus:outline-none"
                >
                  {Array.from({ length: selectedBook.chapters }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Capítulo {i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Chapter Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevChapter}
                  className="p-2 hover:bg-[#222222] border border-[#222222] rounded-xl text-[#8E8E8F] hover:text-white cursor-pointer transition-colors"
                  title="Capítulo Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 text-xs font-mono font-bold text-[#8E8E8F]">
                  {selectedBook.name} {selectedChapter}
                </div>
                <button
                  onClick={nextChapter}
                  className="p-2 hover:bg-[#222222] border border-[#222222] rounded-xl text-[#8E8E8F] hover:text-white cursor-pointer transition-colors"
                  title="Próximo Capítulo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Verses Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans select-text relative">
              {loading ? (
                <div className="absolute inset-0 bg-[#161616]/80 flex flex-col items-center justify-center space-y-2 z-10">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#8E8E8F] font-bold">Carregando textos fieis...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-xs text-red-400 font-bold">{error}</p>
                  <button
                    onClick={() => loadChapter(selectedBook.name, selectedChapter, version)}
                    className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-600/30 transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Biblical Chapter Title Indicator */}
                  <div className="text-center pb-4 border-b border-[#222222]/30">
                    <h3 className="text-lg font-extrabold text-white">{selectedBook.name}</h3>
                    <p className="text-xs text-indigo-400 font-mono font-bold uppercase mt-1">Capítulo {selectedChapter}</p>
                  </div>

                  {verses.map((verse) => {
                    const highlightKey = `${selectedBook.id}_${selectedChapter}_${verse.number}`;
                    const activeHighlightColor = highlights[highlightKey];
                    const hColorObj = HIGHLIGHT_COLORS.find(c => c.id === activeHighlightColor);

                    return (
                      <div
                        key={verse.number}
                        className={`group relative p-2.5 rounded-xl transition-all border border-transparent hover:border-[#222222] hover:bg-[#222222]/10 cursor-pointer ${
                          hColorObj ? hColorObj.bg : ''
                        }`}
                        onClick={() => setActiveVerseNum(verse.number === activeVerseNum ? null : verse.number)}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed text-gray-200">
                          <span className="text-[10px] font-mono font-extrabold text-indigo-400 mr-2 select-none">
                            {verse.number}
                          </span>
                          {verse.text}
                        </p>

                        {/* Hover Overlay Menu / Popover when Clicked */}
                        <AnimatePresence>
                          {activeVerseNum === verse.number && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-2 right-2 -bottom-14 z-20 bg-[#0D0D0D] border border-[#222222] p-2 rounded-xl flex items-center justify-between gap-2 shadow-xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Left actions: Copy / Append */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => copyVerseToClipboard(verse)}
                                  className="p-1.5 hover:bg-[#222222] rounded-lg text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Copiar Versículo"
                                >
                                  <Copy className="w-3.5 h-3.5 text-indigo-400" /> <span className="hidden sm:inline">Copiar</span>
                                </button>
                                <button
                                  onClick={() => appendVerseToNote(verse)}
                                  className="p-1.5 hover:bg-[#222222] rounded-lg text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Enviar para Caderno"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> <span className="hidden sm:inline">Caderno</span>
                                </button>
                              </div>

                              {/* Right actions: Highlight Color Selection */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-[#8E8E8F] uppercase tracking-wider mr-1">Destacar:</span>
                                {HIGHLIGHT_COLORS.map((color) => (
                                  <button
                                    key={color.id}
                                    onClick={() => highlightVerse(verse.number, color.id)}
                                    className={`w-4 h-4 rounded-full border border-[#222222] cursor-pointer transition-transform hover:scale-110 flex items-center justify-center`}
                                    style={{ backgroundColor: color.id === 'yellow' ? '#f59e0b' : color.id === 'green' ? '#10b981' : color.id === 'blue' ? '#3b82f6' : color.id === 'purple' ? '#8b5cf6' : '#ec4899' }}
                                    title={`Destacar em ${color.name}`}
                                  >
                                    {activeHighlightColor === color.id && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                                  </button>
                                ))}
                                {activeHighlightColor && (
                                  <button
                                    onClick={() => highlightVerse(verse.number, null)}
                                    className="p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                                    title="Remover Destaque"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bible Info Footer */}
            <div className="p-3 bg-[#0D0D0D] border-t border-[#222222]/50 text-center">
              <p className="text-[9px] text-[#8E8E8F] font-semibold tracking-wider">
                💡 Dica: Clique em qualquer versículo para abrir opções de destaque com marca-textos coloridos, cópia e colagem rápida no caderno.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Google Docs Notepad Workspace (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161616] border border-[#222222] rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-sm">
            
            {/* Notepad Header & Note Selector */}
            <div className="p-4 border-b border-[#222222]/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Caderno de Estudos Bíblicos</span>
                </div>
                <button
                  onClick={createNote}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3 h-3" /> Novo
                </button>
              </div>

              {/* Note Selector and Rename block */}
              <div className="flex gap-2 items-center">
                <select
                  value={activeNoteId}
                  onChange={(e) => setActiveNoteId(e.target.value)}
                  className="flex-1 bg-[#0D0D0D] border border-[#222222] text-xs text-white px-2.5 py-1.5 rounded-xl cursor-pointer font-bold focus:outline-none"
                >
                  {notes.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={activeNote?.title || ''}
                  onChange={(e) => {
                    if (activeNote) renameNote(activeNote.id, e.target.value);
                  }}
                  className="w-32 bg-[#0D0D0D] border border-[#222222] text-xs text-white px-2.5 py-1.5 rounded-xl font-bold focus:border-indigo-500/50 focus:outline-none"
                  placeholder="Renomear..."
                  title="Renomear este estudo"
                />

                <button
                  disabled={notes.length <= 1}
                  onClick={() => activeNote && deleteNote(activeNote.id)}
                  className="p-1.5 hover:bg-red-500/10 border border-[#222222] hover:border-red-500/30 rounded-xl text-[#8E8E8F] hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Excluir Estudo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Docs Format Toolbar Controls */}
            <div className="bg-[#0D0D0D] border-b border-[#222222]/40 px-3 py-2 flex flex-wrap gap-1 items-center gap-y-2">
              <button
                onClick={() => execCmd('bold')}
                className="p-1 hover:bg-[#222222] rounded text-gray-300 hover:text-white cursor-pointer transition-colors"
                title="Negrito"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execCmd('italic')}
                className="p-1 hover:bg-[#222222] rounded text-gray-300 hover:text-white cursor-pointer transition-colors"
                title="Itálico"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execCmd('underline')}
                className="p-1 hover:bg-[#222222] rounded text-gray-300 hover:text-white cursor-pointer transition-colors"
                title="Sublinhado"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              
              <div className="w-px h-4 bg-[#222222] mx-1"></div>

              {/* Text formats */}
              <button
                onClick={() => execCmd('formatBlock', '<h2>')}
                className="px-1.5 py-0.5 hover:bg-[#222222] rounded text-[10px] font-bold text-indigo-400 cursor-pointer"
                title="Título H2"
              >
                H2
              </button>
              <button
                onClick={() => execCmd('formatBlock', '<p>')}
                className="px-1.5 py-0.5 hover:bg-[#222222] rounded text-[10px] font-bold text-gray-400 cursor-pointer"
                title="Parágrafo"
              >
                Texto
              </button>

              <div className="w-px h-4 bg-[#222222] mx-1"></div>

              <button
                onClick={() => execCmd('insertUnorderedList')}
                className="p-1 hover:bg-[#222222] rounded text-gray-300 hover:text-white cursor-pointer transition-colors"
                title="Lista de Marcadores"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              {/* Colors */}
              <button
                onClick={() => execCmd('foreColor', '#818cf8')}
                className="p-1 hover:bg-[#222222] rounded text-indigo-400 cursor-pointer"
                title="Cor de Texto Roxa"
              >
                <Type className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => execCmd('hiliteColor', '#f59e0b')}
                className="p-1 hover:bg-[#222222] rounded text-yellow-500 cursor-pointer"
                title="Marca-texto Amarelo"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-[#222222] mx-1"></div>

              {/* Clear */}
              <button
                onClick={() => execCmd('removeFormat')}
                className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded text-[#8E8E8F] cursor-pointer"
                title="Limpar Formatação"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Deseja apagar todo o conteúdo deste estudo?")) {
                    if (editorRef.current) {
                      editorRef.current.innerHTML = "<p><br></p>";
                      saveEditorContent();
                    }
                  }
                }}
                className="p-1 hover:bg-red-500/15 hover:text-red-400 rounded text-red-500/80 cursor-pointer flex items-center gap-1"
                title="Apagar Tudo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Actual Google Docs Styled Page */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0D0D0D] flex flex-col items-center justify-center">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-[#161616] rounded-2xl border border-[#222222]/50 max-w-xl w-full min-h-[380px] space-y-4 shadow-inner">
                  <FileText className="w-12 h-12 text-indigo-500/55 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Nenhum estudo cadastrado ainda.</h4>
                    <p className="text-[#8E8E8F] text-[10px] mt-1 leading-relaxed">
                      Crie um novo estudo para começar a fazer suas anotações e reflexões bíblicas.
                    </p>
                  </div>
                  <button
                    onClick={createNote}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Criar Novo Estudo
                  </button>
                </div>
              ) : (
                <div 
                  ref={editorRef}
                  contentEditable
                  onInput={saveEditorContent}
                  className="w-full max-w-xl min-h-[380px] p-6 bg-[#161616] text-gray-200 text-xs sm:text-sm leading-relaxed rounded-xl shadow border border-[#222222]/30 focus:outline-none select-text prose prose-invert prose-xs"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              )}
              {notes.length > 0 && (
                <p className="text-[10px] text-[#8E8E8F] text-center mt-3 max-w-sm">
                  📌 <b>Nota:</b> O caderno funciona como um documento de texto (Google Docs). Para remover ou editar qualquer versículo ou parágrafo, basta clicar nele no caderno e pressionar a tecla <b>Backspace</b> ou <b>Delete</b> no teclado.
                </p>
              )}
            </div>

            {/* Docs Footer Info */}
            <div className="p-3 bg-[#161616] border-t border-[#222222]/50 flex items-center justify-between text-[10px] text-[#8E8E8F]">
              <span>Última atualização: {activeNote?.updatedAt}</span>
              <span className="font-semibold text-indigo-400 uppercase tracking-wider">Sem Limites</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
