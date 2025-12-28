import React, { useState, useCallback, useEffect, useRef } from 'react';
import KeyButton from './components/KeyButton';
import TerminalDisplay from './components/TerminalDisplay';
import { generatePowerShellCommand } from './services/geminiService';
import { getLayout, Icons, AI_WEB_LINKS, ProviderIcons, NANO_SHORTCUTS } from './constants';
import { KeyboardState, KeyConfig, KeyType, TerminalLine, AppSettings, AIProvider, Theme, WindowLayer } from './types';

// Add type definition for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

// Special Characters for CharMap
const SPECIAL_CHARS = [
  '©', '®', '™', '€', '£', '¥', '¢', '$',
  '°', '±', '÷', '×', 'µ', 'π', '∞', '√',
  '←', '↑', '→', '↓', '↔', '⇒', '⇐', '⇔',
  '•', '§', '¶', '†', '‡', '…', '·', '—',
  '∀', '∃', '∅', '∈', '∉', '⊂', '⊃', '∪',
  '∩', '∧', '∨', '¬', '≈', '≠', '≤', '≥',
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'Ω',
  '☺', '♥', '♦', '♣', '♠', '♪', '♫', '☼'
];

const DEFAULT_SETTINGS: AppSettings = {
  fontScale: 1,
  opacity: 0.85,
  clickSound: false,
  highContrast: false,
  showBar: true,
  showInputPreview: true,
  theme: 'dark',
  windowLayer: 'always-on-top', // Default high priority
  aiConfig: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview',
    endpoint: ''
  }
};

const PROVIDERS_LIST = [
  { id: 'gemini', name: 'Google Gemini', icon: ProviderIcons.Gemini },
  { id: 'openai', name: 'OpenAI', icon: ProviderIcons.OpenAI },
  { id: 'anthropic', name: 'Anthropic', icon: ProviderIcons.Claude },
  { id: 'perplexity', name: 'Perplexity', icon: ProviderIcons.Perplexity },
  { id: 'openrouter', name: 'OpenRouter', icon: ProviderIcons.OpenRouter },
  { id: 'openwebui', name: 'Open WebUI', icon: ProviderIcons.OpenWebUI },
  { id: 'custom', name: 'Custom (OpenAI)', icon: ProviderIcons.Custom },
];

const App: React.FC = () => {
  // --- State ---
  const [inputBuffer, setInputBuffer] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Clipboard State
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [securityOverlay, setSecurityOverlay] = useState(false); 
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('win11-kb-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          aiConfig: {
            ...DEFAULT_SETTINGS.aiConfig,
            ...(parsed.aiConfig || {})
          }
        };
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Dropdown state for Provider Selection
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // AI & Terminal
  const [showTerminal, setShowTerminal] = useState(false); 
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: 'info', content: 'PowerShell 7.4.1\nLoading AI modules...' }
  ]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tool State
  const [isCharMapOpen, setIsCharMapOpen] = useState(false);
  const [isNanoOpen, setIsNanoOpen] = useState(false); // Controls Nano Bar
  
  // Voice
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  
  // Window Position
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [minimizedPos, setMinimizedPos] = useState({ x: window.innerWidth / 2 - 120, y: 20 });
  
  // Nano Toolbar Position & Size
  const [nanoPos, setNanoPos] = useState({ x: 50, y: 20 });
  const [nanoWidth, setNanoWidth] = useState(600);
  
  // AI Window Position
  const [aiWindowPos, setAiWindowPos] = useState({ x: window.innerWidth / 2 - 200, y: 100 });

  // Clipboard Window Position
  const [clipboardPos, setClipboardPos] = useState({ x: window.innerWidth / 2 - 150, y: 150 });

  // Settings Window Position & Size
  const [settingsPos, setSettingsPos] = useState({ x: 100, y: 100 });
  const [settingsSize, setSettingsSize] = useState({ w: 350, h: 500 });
  
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isNanoDragging, setIsNanoDragging] = useState(false);
  const [isNanoResizing, setIsNanoResizing] = useState(false);
  const [isAiWindowDragging, setIsAiWindowDragging] = useState(false);
  const [isSettingsDragging, setIsSettingsDragging] = useState(false);
  const [isSettingsResizing, setIsSettingsResizing] = useState(false);
  const [isClipboardDragging, setIsClipboardDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const nanoDragOffset = useRef({ x: 0, y: 0 });
  const aiDragOffset = useRef({ x: 0, y: 0 });
  const clipboardDragOffset = useRef({ x: 0, y: 0 });
  const settingsDragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, w: 0 });
  const settingsResizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    capsLock: false,
    shift: false,
    ctrl: false,
    alt: false,
    win: false,
    fn: false,
  });

  const [physicalKeysPressed, setPhysicalKeysPressed] = useState<Set<string>>(new Set());

  // Refs
  const isAIModalOpenRef = useRef(isAIModalOpen);
  const isSettingsOpenRef = useRef(isSettingsOpen);
  const isCharMapOpenRef = useRef(isCharMapOpen);
  const isClipboardOpenRef = useRef(isClipboardOpen);

  useEffect(() => { isAIModalOpenRef.current = isAIModalOpen; }, [isAIModalOpen]);
  useEffect(() => { isSettingsOpenRef.current = isSettingsOpen; }, [isSettingsOpen]);
  useEffect(() => { isCharMapOpenRef.current = isCharMapOpen; }, [isCharMapOpen]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isClipboardOpenRef.current = isClipboardOpen; }, [isClipboardOpen]);

  // --- Helper: Notification ---
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  // --- Audio ---
  useEffect(() => {
    if (settings.clickSound && !audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContextRef.current = new AudioCtx();
    }
  }, [settings.clickSound]);

  const playClickSound = () => {
    if (!settings.clickSound || !audioContextRef.current) return;
    try {
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // --- Voice Input ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          if (isAIModalOpenRef.current) setAiPrompt(prev => prev + finalTranscript + ' ');
          else updateInput(inputBuffer + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
           setIsListening(false);
           alert("Microphone access denied.");
        } else if (event.error === 'network') {
           setIsListening(false);
           showNotification("Network Error");
        } else {
           setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
           try { recognition.start(); } catch(e) { setTimeout(() => { if (isListeningRef.current) try { recognition.start(); } catch(e2) {} }, 500); }
        }
      };
      recognitionRef.current = recognition;
    }
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, [inputBuffer]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) { try { recognition.start(); } catch (e) {} } else { recognition.stop(); }
  }, [isListening]);


  // --- Logic ---
  const saveSettings = () => {
    try {
      localStorage.setItem('win11-kb-settings', JSON.stringify(settings));
      setIsSettingsOpen(false);
      setIsProviderDropdownOpen(false);
      showNotification("Settings Saved Successfully");
    } catch (e) {
      showNotification("Error Saving Settings");
    }
  };

  const updateInput = (newValue: string) => {
    if (newValue !== inputBuffer) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newValue);
      if (nextHistory.length > 50) nextHistory.shift();
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setInputBuffer(newValue);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInputBuffer(history[newIndex]);
      showNotification("Undo");
    } else {
      showNotification("Nothing to undo");
    }
  }, [history, historyIndex]);

  const addToClipboard = (text: string) => {
      if(!text) return;
      // Try copy to system clipboard
      try {
        window.focus();
        navigator.clipboard.writeText(text).then(() => {
           showNotification("Copied");
        }).catch(err => {
           console.warn("System copy failed", err);
           showNotification("Copied to History");
        });
      } catch (e) {
        // Ignore system errors, still add to internal history
      }
      
      setClipboardHistory(prev => {
           const newHistory = [text, ...prev.filter(t => t !== text)].slice(0, 20); 
           return newHistory;
      });
  };

  const handleCopy = () => {
    const textToCopy = isAIModalOpenRef.current ? aiPrompt : inputBuffer;
    addToClipboard(textToCopy);
  };

  const handleCut = () => {
     const textToCopy = isAIModalOpenRef.current ? aiPrompt : inputBuffer;
     addToClipboard(textToCopy);
     if (isAIModalOpenRef.current) setAiPrompt('');
     else updateInput('');
     showNotification("Cut");
  };

  const handlePaste = async () => {
    try {
       window.focus();
       // First try checking permissions if available
       if (navigator.permissions && navigator.permissions.query) {
         try {
           const result = await navigator.permissions.query({ name: 'clipboard-read' as any });
           if (result.state === 'denied') {
             throw new Error("Clipboard permission denied");
           }
         } catch(e) {
           // ignore if query fails
         }
       }

       const text = await navigator.clipboard.readText();
       if (text) {
         if (isAIModalOpenRef.current) setAiPrompt(prev => prev + text);
         else updateInput(inputBuffer + text);
         showNotification("Pasted");
         // Add to history
         setClipboardHistory(prev => {
             const newHistory = [text, ...prev.filter(t => t !== text)].slice(0, 20);
             return newHistory;
         });
       }
    } catch (err) {
       console.error("Paste failed", err);
       // Fallback: If readText fails (e.g. Firefox default config, or iframe blocks), 
       // we might not be able to read system clipboard. 
       // We can only access internal history.
       showNotification("Check Clipboard History");
       setIsClipboardOpen(true);
    }
  };

  const handleSelectAll = () => {
      // In a real app we'd focus the input and select, here we just notify
      showNotification("Select All");
  };

  const handleGenerateCommand = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTerminalLines(prev => [...prev, { type: 'input', content: `# Request: ${aiPrompt}` }]);
    try {
      const command = await generatePowerShellCommand(aiPrompt, settings.aiConfig);
      setTerminalLines(prev => [...prev, { type: 'output', content: command }]);
      updateInput(command);
      setShowTerminal(true); 
      setIsAIModalOpen(false);
      setAiPrompt('');
    } catch (error) {
      setTerminalLines(prev => [...prev, { type: 'error', content: 'Failed to generate command.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = useCallback((keyId: string, config: KeyConfig) => {
    playClickSound();

    // 0. Handle Fn Layer ID Substitution
    let effectiveId = keyId;
    if (keyboardState.fn && config.fnId) {
      effectiveId = config.fnId;
      if (!isAIModalOpenRef.current) updateInput(inputBuffer + `[${effectiveId}]`); // Simulate F-key press
      return;
    }

    // 1. Modifiers & Toggles
    if (config.type === KeyType.MODIFIER) {
      if (keyId.includes('Shift')) setKeyboardState(p => ({ ...p, shift: !p.shift }));
      if (keyId.includes('Control')) setKeyboardState(p => ({ ...p, ctrl: !p.ctrl }));
      if (keyId.includes('Alt')) setKeyboardState(p => ({ ...p, alt: !p.alt }));
      if (keyId.includes('Win')) setKeyboardState(p => ({ ...p, win: !p.win }));
      return;
    }

    if (config.type === KeyType.TOGGLE) {
      if (keyId === 'CapsLock') setKeyboardState(p => ({ ...p, capsLock: !p.capsLock }));
      if (keyId === 'Fn') setKeyboardState(p => ({ ...p, fn: !p.fn }));
      if (keyId === 'Mic') setIsListening(prev => !prev);
      return;
    }

    // 2. Special Keys
    if (config.type === KeyType.SPECIAL) {
      if (keyId === 'PSAdmin') {
        if (!isAdminMode) {
          setIsAdminMode(true);
          setTerminalLines(prev => [...prev, { type: 'info', content: 'Administrator mode active.' }]);
        }
        if (inputBuffer.trim()) {
          setTerminalLines(prev => [...prev, { type: 'input', content: inputBuffer }, { type: 'info', content: 'Command executed.' }]);
          updateInput('');
        }
        setShowTerminal(true);
        return;
      }
      if (keyId === 'AI') {
        setIsAIModalOpen(true);
        return;
      }
      if (keyId === 'CharMap') {
        setIsCharMapOpen(prev => !prev);
        setIsNanoOpen(false);
        return;
      }
      if (keyId === 'Nano' || keyId === 'Nav') {
         setIsNanoOpen(prev => !prev);
         setIsCharMapOpen(false);
         return;
      }
      if (keyId === 'CAD') {
         setSecurityOverlay(true);
         return;
      }
      if (keyId === 'Clipboard') {
         setIsClipboardOpen(prev => !prev);
         return;
      }
      if (keyId === 'Settings') {
         setIsSettingsOpen(true);
         return;
      }
    }

    // 3. Routing
    const targetText = isAIModalOpenRef.current ? aiPrompt : inputBuffer;
    const setTargetText = isAIModalOpenRef.current ? setAiPrompt : updateInput;

    // 4. Actions
    if (config.type === KeyType.ACTION) {
      if (keyId === 'Backspace') setTargetText(targetText.slice(0, -1));
      else if (keyId === 'Clear') setTargetText('');
      else if (keyId === 'Enter') {
        if (isAIModalOpenRef.current) handleGenerateCommand();
        else {
            setTerminalLines(prev => [...prev, { type: 'input', content: inputBuffer }]);
            if (inputBuffer.toLowerCase().includes('help')) setTerminalLines(prev => [...prev, { type: 'info', content: 'Try using the AI key.' }]);
            updateInput('');
            setShowTerminal(true);
        }
      } else if (keyId === 'Esc') {
        updateInput('');
        setIsAIModalOpen(false);
        setIsListening(false);
        setIsCharMapOpen(false);
        setIsNanoOpen(false);
        setSecurityOverlay(false);
        setIsClipboardOpen(false);
      } else if (keyId === 'Copy') handleCopy();
      else if (keyId === 'Paste') handlePaste();
      else if (keyId === 'Cut') handleCut();
      else if (keyId === 'SelectAll') handleSelectAll();
      else if (keyId === 'LeftClick' || keyId === 'RightClick') {
         // Visualize click action
         showNotification(keyId === 'LeftClick' ? 'Left Click' : 'Right Click');
      }
      return;
    }

    // 5. Normal Typing
    if (config.type === KeyType.NORMAL) {
      if (keyboardState.ctrl) {
        if (keyId === 'KeyZ') handleUndo();
        else if (keyId === 'KeyC') handleCopy();
        else if (keyId === 'KeyV') handlePaste();
        else if (keyId === 'KeyX') handleCut(); 
        else if (keyId === 'KeyA') handleSelectAll();
        setKeyboardState(p => ({ ...p, ctrl: false }));
        return;
      }

      if (keyId === 'ArrowUp') { setTargetText(targetText + '↑'); return; }
      if (keyId === 'ArrowDown') { setTargetText(targetText + '↓'); return; }
      if (keyId === 'ArrowLeft') { setTargetText(targetText + '←'); return; }
      if (keyId === 'ArrowRight') { setTargetText(targetText + '→'); return; }

      let char = '';
      if (typeof config.label === 'string' && config.label.length === 1 && /[a-z]/i.test(config.label)) {
        const isUpperCase = keyboardState.shift !== keyboardState.capsLock;
        char = isUpperCase ? config.label.toUpperCase() : config.label.toLowerCase();
      } else if (config.secondaryLabel && keyboardState.shift) {
        char = config.secondaryLabel;
      } else if (typeof config.label === 'string') {
        char = config.label;
      }
      setTargetText(targetText + char);
      
      if (keyboardState.shift) setKeyboardState(p => ({ ...p, shift: false }));
      if (keyboardState.alt) setKeyboardState(p => ({ ...p, alt: false }));
    }
  }, [inputBuffer, aiPrompt, keyboardState, settings.clickSound, isAdminMode, history, historyIndex, handleUndo]);

  // --- Drag Logic (Main Keyboard) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return; 
    if ((e.target as HTMLElement).closest('button')) return;
    
    // Determine which coordinate system to use (minimized or normal)
    const currentPos = isMinimized ? minimizedPos : position;
    
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - currentPos.x, y: e.clientY - currentPos.y };
  };

  // --- Drag Logic (Nano Bar) ---
  const handleNanoMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).classList.contains('resize-handle')) return;
    setIsNanoDragging(true);
    nanoDragOffset.current = { x: e.clientX - nanoPos.x, y: e.clientY - nanoPos.y };
  };

  const handleNanoResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNanoResizing(true);
    resizeStart.current = { x: e.clientX, w: nanoWidth };
  };

  // --- Drag Logic (AI Window) ---
  const handleAiMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea') || (e.target as HTMLElement).closest('input')) return;
    setIsAiWindowDragging(true);
    aiDragOffset.current = { x: e.clientX - aiWindowPos.x, y: e.clientY - aiWindowPos.y };
  };

  // --- Drag Logic (Clipboard Window) ---
  const handleClipboardMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsClipboardDragging(true);
    clipboardDragOffset.current = { x: e.clientX - clipboardPos.x, y: e.clientY - clipboardPos.y };
  };

  // --- Drag Logic (Settings Window) ---
  const handleSettingsMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select') || (e.target as HTMLElement).closest('input')) return;
    setIsSettingsDragging(true);
    settingsDragOffset.current = { x: e.clientX - settingsPos.x, y: e.clientY - settingsPos.y };
  };

  const handleSettingsResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsResizing(true);
    settingsResizeStart.current = { x: e.clientX, y: e.clientY, w: settingsSize.w, h: settingsSize.h };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Main Keyboard Drag
      if (isDragging) {
         const newX = e.clientX - dragOffset.current.x;
         const newY = e.clientY - dragOffset.current.y;
         if (isMinimized) setMinimizedPos({ x: newX, y: newY });
         else setPosition({ x: newX, y: newY });
      }
      // Nano Bar Drag
      if (isNanoDragging) {
         setNanoPos({ x: e.clientX - nanoDragOffset.current.x, y: e.clientY - nanoDragOffset.current.y });
      }
      // Nano Bar Resize
      if (isNanoResizing) {
         const delta = e.clientX - resizeStart.current.x;
         setNanoWidth(Math.max(300, resizeStart.current.w + delta));
      }
      // AI Window Drag
      if (isAiWindowDragging) {
         setAiWindowPos({ x: e.clientX - aiDragOffset.current.x, y: e.clientY - aiDragOffset.current.y });
      }
      // Clipboard Window Drag
      if (isClipboardDragging) {
         setClipboardPos({ x: e.clientX - clipboardDragOffset.current.x, y: e.clientY - clipboardDragOffset.current.y });
      }
      // Settings Drag
      if (isSettingsDragging) {
         setSettingsPos({ x: e.clientX - settingsDragOffset.current.x, y: e.clientY - settingsDragOffset.current.y });
      }
      // Settings Resize
      if (isSettingsResizing) {
         const deltaX = e.clientX - settingsResizeStart.current.x;
         const deltaY = e.clientY - settingsResizeStart.current.y;
         setSettingsSize({ 
           w: Math.max(300, settingsResizeStart.current.w + deltaX), 
           h: Math.max(300, settingsResizeStart.current.h + deltaY) 
         });
      }
    };
    
    const handleMouseUp = () => {
       setIsDragging(false);
       setIsNanoDragging(false);
       setIsNanoResizing(false);
       setIsAiWindowDragging(false);
       setIsSettingsDragging(false);
       setIsSettingsResizing(false);
       setIsClipboardDragging(false);
    };

    if (isDragging || isNanoDragging || isNanoResizing || isAiWindowDragging || isSettingsDragging || isSettingsResizing || isClipboardDragging) { 
      window.addEventListener('mousemove', handleMouseMove); 
      window.addEventListener('mouseup', handleMouseUp); 
    }
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [isDragging, isMinimized, isNanoDragging, isNanoResizing, isAiWindowDragging, isSettingsDragging, isSettingsResizing, isClipboardDragging]);

  // --- Physical Keyboard ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let virtualId = '';
      if (e.code.startsWith('Key') || e.code.startsWith('Digit')) virtualId = e.code;
      else if (['Backspace','Enter','Escape','Space','Tab'].includes(e.key)) virtualId = e.key === 'Escape' ? 'Esc' : e.key;
      else if (['Shift','Control','Alt'].includes(e.key)) virtualId = e.code;
      
      if (virtualId) setPhysicalKeysPressed(prev => new Set(prev).add(virtualId));
      else getLayout().flat().forEach(k => { if (k.label === e.key || k.secondaryLabel === e.key) setPhysicalKeysPressed(prev => new Set(prev).add(k.id)); });

      if (isSettingsOpenRef.current || isCharMapOpenRef.current) return;
      if (e.key === 'Escape') { 
        setIsAIModalOpen(false); 
        setIsListening(false); 
        setIsSettingsOpen(false); 
        setIsCharMapOpen(false); 
        setIsNanoOpen(false); 
        setSecurityOverlay(false);
        setIsClipboardOpen(false);
        return; 
      }
      if (isAIModalOpenRef.current) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { 
          // Browser native paste handles default, we intercept for our buffer
          // We let the event propagate usually, but here we can manually read?
          // The keydown handler for 'KeyV' in virtual layout handles it
      }
      
      if (e.key === 'Backspace') updateInput(inputBuffer.slice(0, -1));
      else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) updateInput(inputBuffer + e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
       setPhysicalKeysPressed(prev => { const n = new Set(prev); n.clear(); return n; }); 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [inputBuffer, handleUndo]); 

  const layout = getLayout();
  const renderLayout = layout.map(row => row.map(key => {
    if (key.id === 'AI') return { ...key, isActive: isAIModalOpen };
    if (key.id === 'Mic') return { ...key, isActive: isListening };
    if (key.id === 'CharMap') return { ...key, isActive: isCharMapOpen };
    if (key.id === 'Nano') return { ...key, isActive: isNanoOpen };
    if (key.id === 'Clipboard') return { ...key, isActive: isClipboardOpen };
    if (key.id === 'CAD') return { ...key, isActive: securityOverlay };
    if (physicalKeysPressed.has(key.id)) return { ...key, isActive: true };
    return key;
  }));
  
  // Theme Background Logic
  const getThemeBg = () => {
    if (settings.highContrast) return '#000000';
    if (settings.theme === 'light') return `rgba(240, 240, 240, ${settings.opacity})`;
    if (settings.theme === 'blue') return `rgba(0, 50, 90, ${settings.opacity})`;
    if (settings.theme === 'cyber') return `rgba(10, 10, 10, ${settings.opacity})`;
    return `rgba(32, 32, 32, ${settings.opacity})`; // Dark
  };

  const getThemeBorder = () => {
    if (settings.highContrast) return '2px solid #FFD700';
    if (settings.theme === 'light') return '1px solid #ccc';
    if (settings.theme === 'blue') return '1px solid #4da6ff';
    if (settings.theme === 'cyber') return '1px solid #ec4899'; // Pink
    return '1px solid rgba(255, 255, 255, 0.1)';
  };

  // Determine Z-Index based on setting
  const getZIndex = () => {
    switch (settings.windowLayer) {
      case 'always-on-top': return 9999;
      case 'background': return 1;
      case 'standard': default: return 50;
    }
  };

  if (isMinimized) {
    return (
      <div 
         className="fixed cursor-move flex items-center gap-1 p-1 rounded-t-lg backdrop-blur-xl animate-fade-in select-none shadow-xl border-t border-x"
         style={{ 
            left: minimizedPos.x, 
            top: minimizedPos.y, 
            zIndex: getZIndex(),
            backgroundColor: settings.theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,30,0.85)',
            borderColor: settings.theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            height: '36px'
         }} 
         onMouseDown={handleMouseDown}
      >
        <div className="px-2 cursor-move opacity-60 hover:opacity-100"><Icons.DragHandle /></div>
        <button 
           className={`p-1.5 rounded transition-all hover:bg-white/10 ${settings.theme === 'light' ? 'text-black' : 'text-white'}`}
           onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
           title="Restore Keyboard"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <rect x="2" y="6" width="20" height="12" rx="2" />
               <path d="M6 10h1" /><path d="M10 10h1" /><path d="M14 10h1" /><path d="M18 10h1" />
            </svg>
        </button>
        <div className="w-[1px] h-4 bg-gray-500/30 mx-1"></div>
        <button 
           className={`p-1.5 rounded transition-all hover:bg-white/10 ${settings.theme === 'light' ? 'text-black' : 'text-white'}`}
           onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
           title="Settings"
        >
           <Icons.Settings />
        </button>
      </div>
    );
  }

  // Find current provider info for settings button
  const currentProvider = PROVIDERS_LIST.find(p => p.id === settings.aiConfig.provider) || PROVIDERS_LIST[0];

  return (
    <>
      {/* Security Overlay */}
      {securityOverlay && (
         <div className="fixed inset-0 z-[10000] bg-[#004275] flex flex-col items-center justify-center font-['Segoe_UI'] text-white animate-fade-in">
            <div className="flex flex-col gap-6 items-center w-full max-w-sm">
                <button className="text-xl hover:text-gray-300">Lock</button>
                <button className="text-xl hover:text-gray-300">Switch User</button>
                <button className="text-xl hover:text-gray-300">Sign out</button>
                <button className="text-xl hover:text-gray-300">Task Manager</button>
                <div className="h-8"></div>
                <button onClick={() => setSecurityOverlay(false)} className="px-6 py-2 border border-white/30 rounded hover:bg-white/10">Cancel</button>
            </div>
         </div>
      )}

      {/* Clipboard History Window */}
      {isClipboardOpen && (
         <div
            className="fixed flex flex-col rounded-xl shadow-2xl animate-fade-in overflow-hidden border backdrop-blur-xl"
            style={{
               left: clipboardPos.x, top: clipboardPos.y, width: '300px', maxHeight: '400px',
               zIndex: getZIndex() + 6,
               backgroundColor: settings.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(32,32,32,0.95)',
               borderColor: getThemeBorder().split(' ')[2],
            }}
            onMouseDown={handleClipboardMouseDown}
         >
            <div className="flex items-center justify-between p-3 border-b border-white/10 cursor-move bg-black/10 shrink-0">
               <div className="flex items-center gap-2 font-semibold text-sm">
                  <div className={`${settings.theme === 'light' ? 'text-blue-600' : 'text-white'}`}><Icons.Clipboard /></div>
                  <span className={`${settings.theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Clipboard History</span>
               </div>
               <button onClick={() => setIsClipboardOpen(false)} className="text-gray-500 hover:text-red-400 p-1">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
               {clipboardHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 text-xs">History is empty</div>
               ) : (
                  clipboardHistory.map((item, idx) => (
                     <button
                        key={idx}
                        onClick={() => {
                           if (isAIModalOpen) setAiPrompt(prev => prev + item);
                           else updateInput(inputBuffer + item);
                           setIsClipboardOpen(false);
                        }}
                        className={`w-full text-left p-2 mb-1 rounded text-xs truncate transition-colors ${settings.theme === 'light' ? 'hover:bg-gray-200 text-black' : 'hover:bg-white/10 text-gray-200'}`}
                     >
                        {item}
                     </button>
                  ))
               )}
            </div>
         </div>
      )}

      {/* AI Assistant Floating Window */}
      {isAIModalOpen && (
        <div 
          className="fixed flex flex-col rounded-xl shadow-2xl animate-fade-in overflow-hidden border backdrop-blur-xl"
          style={{ 
             left: aiWindowPos.x, top: aiWindowPos.y, width: '450px',
             zIndex: getZIndex() + 5, // Ensure it's slightly above if overlapping
             backgroundColor: settings.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(32,32,32,0.95)',
             borderColor: getThemeBorder().split(' ')[2], // Extract color
          }}
          onMouseDown={handleAiMouseDown}
        >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 cursor-move bg-black/10">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <div className={`${settings.theme === 'light' ? 'text-blue-600' : 'text-white'}`}><Icons.AI /></div>
                  <span className={`${settings.theme === 'light' ? 'text-gray-800' : 'text-white'}`}>AI Assistant</span>
                </div>
                <button onClick={() => setIsAIModalOpen(false)} className="text-gray-500 hover:text-red-400 p-1">✕</button>
            </div>

            <div className="p-4 flex flex-col gap-4">
               {/* Section 1: Command Generator (API) */}
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Command Generator</span>
                     <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <span>Using:</span>
                        <currentProvider.icon />
                        <span className="text-gray-500 font-semibold">{currentProvider.name}</span>
                     </div>
                  </div>
                  <div className="relative">
                     <textarea 
                       className={`w-full h-16 border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 resize-none ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black placeholder-gray-400' : 'bg-black/40 border-white/10 text-white placeholder-gray-600'}`}
                       placeholder="Type your command description here..."
                       value={aiPrompt}
                       onChange={(e) => setAiPrompt(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerateCommand(); } }}
                       autoFocus
                     />
                     <button 
                       onClick={handleGenerateCommand} 
                       disabled={isGenerating || !aiPrompt.trim()} 
                       className="absolute bottom-2 right-2 px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 disabled:opacity-50"
                     >
                       {isGenerating ? 'Thinking...' : 'Generate'}
                     </button>
                  </div>
               </div>

               <hr className="border-white/10" />

               {/* Section 2: Web Links Grid */}
               <div className="flex flex-col gap-2">
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Launch Web Interface</span>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_WEB_LINKS.map((link) => {
                       const finalUrl = link.name === 'Open WebUI' && settings.aiConfig.endpoint 
                         ? settings.aiConfig.endpoint 
                         : link.url;
                       
                       return (
                         <button
                           key={link.name}
                           onClick={() => {
                              window.open(finalUrl, '_blank');
                              setIsAIModalOpen(false);
                           }}
                           className={`flex items-center gap-2 p-2 rounded-lg border transition-all group text-left ${settings.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 border-gray-200' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}
                         >
                            <div className="w-6 h-6 rounded-full bg-black/10 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                               <div className={settings.theme === 'light' ? 'text-gray-700' : 'text-white'}><link.icon /></div>
                            </div>
                            <div className="flex flex-col overflow-hidden min-w-0">
                               <span className={`text-xs font-bold truncate ${settings.theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{link.name}</span>
                            </div>
                         </button>
                       )
                    })}
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* Settings Floating Window (Resizable & Draggable) */}
      {isSettingsOpen && (
        <div 
          className="fixed z-[10000] flex flex-col rounded-xl shadow-2xl animate-fade-in overflow-hidden border backdrop-blur-xl"
          style={{ 
             left: settingsPos.x, top: settingsPos.y, 
             width: settingsSize.w, height: settingsSize.h,
             backgroundColor: settings.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(32,32,32,0.95)',
             borderColor: getThemeBorder().split(' ')[2], 
          }}
          onMouseDown={handleSettingsMouseDown}
          onClick={() => { if(isProviderDropdownOpen) setIsProviderDropdownOpen(false); }}
        >
            <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0 cursor-move bg-black/10">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <div className={`${settings.theme === 'light' ? 'text-blue-600' : 'text-white'}`}><Icons.Settings /></div>
                  <span className={`${settings.theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Settings</span>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-red-400 p-1">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
                {/* Visuals */}
                <div className={`p-3 rounded-lg border flex flex-col gap-3 shrink-0 ${settings.theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                   <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Visuals</div>
                   
                   {/* Theme Selector */}
                   <div className="flex flex-col gap-1">
                      <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Theme</label>
                      <select 
                        className={`border rounded px-2 py-2 text-xs focus:border-blue-500 outline-none ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-black/40 border-white/10 text-white'}`}
                        value={settings.theme}
                        onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as Theme }))}
                      >
                         <option value="dark">Dark Glass (Default)</option>
                         <option value="light">Light Clean</option>
                         <option value="blue">Classic Blue</option>
                         <option value="cyber">Cyberpunk Neon</option>
                      </select>
                   </div>

                   {/* Toggle Control Bar */}
                   <div className="flex items-center justify-between mt-2">
                      <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Show Bottom Control Bar</label>
                      <input 
                        type="checkbox" 
                        checked={settings.showBar} 
                        onChange={(e) => setSettings(prev => ({ ...prev, showBar: e.target.checked }))}
                        className="accent-blue-600 w-4 h-4 rounded"
                      />
                   </div>

                   {/* Toggle Input Preview */}
                   <div className="flex items-center justify-between mt-2">
                      <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Show Input Preview Bar</label>
                      <input 
                        type="checkbox" 
                        checked={settings.showInputPreview} 
                        onChange={(e) => setSettings(prev => ({ ...prev, showInputPreview: e.target.checked }))}
                        className="accent-blue-600 w-4 h-4 rounded"
                      />
                   </div>

                   {/* Window Layering */}
                   <div className="flex flex-col gap-1 mt-2">
                      <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Window Layering</label>
                      <div className="grid grid-cols-3 gap-1">
                         {(['always-on-top', 'standard', 'background'] as WindowLayer[]).map((layer) => (
                           <button
                             key={layer}
                             onClick={() => setSettings(prev => ({ ...prev, windowLayer: layer }))}
                             className={`text-[10px] py-1.5 rounded border border-transparent transition-colors ${settings.windowLayer === layer ? 'bg-blue-600 text-white shadow-sm' : (settings.theme === 'light' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-black/40 text-gray-400 hover:bg-white/10')}`}
                           >
                             {layer === 'always-on-top' ? 'Top' : layer === 'standard' ? 'Std' : 'Back'}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                {/* AI Config */}
                <div className={`p-3 rounded-lg border flex flex-col gap-3 shrink-0 ${settings.theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">AI Provider</div>
                  
                  {/* Custom Dropdown for Provider with Icons */}
                  <div className="flex flex-col gap-1 relative">
                    <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Provider</label>
                    <div className="relative">
                       <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            setIsProviderDropdownOpen(!isProviderDropdownOpen);
                         }}
                         className={`w-full flex items-center justify-between border rounded px-2 py-2 text-xs focus:border-blue-500 outline-none ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-black/40 border-white/10 text-white'}`}
                       >
                          <div className="flex items-center gap-2">
                             <currentProvider.icon />
                             <span>{currentProvider.name}</span>
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`}>
                             <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                       </button>

                       {isProviderDropdownOpen && (
                          <div className={`absolute top-full left-0 right-0 mt-1 border rounded shadow-xl z-50 max-h-60 overflow-y-auto ${settings.theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#252525] border-white/10'}`}>
                             {PROVIDERS_LIST.map((p) => (
                                <button
                                   key={p.id}
                                   onClick={() => {
                                      setSettings(prev => ({ ...prev, aiConfig: { ...prev.aiConfig, provider: p.id as AIProvider } }));
                                      setIsProviderDropdownOpen(false);
                                   }}
                                   className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${settings.theme === 'light' ? 'hover:bg-gray-100 text-black' : 'hover:bg-white/10 text-gray-200'} ${settings.aiConfig.provider === p.id ? 'bg-blue-600/20 text-blue-400' : ''}`}
                                >
                                   <div className="w-4 h-4 flex items-center justify-center text-current"><p.icon /></div>
                                   <span>{p.name}</span>
                                </button>
                             ))}
                          </div>
                       )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                     <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>API Key</label>
                     <input type="password" value={settings.aiConfig.apiKey} onChange={(e) => setSettings(prev => ({...prev, aiConfig: {...prev.aiConfig, apiKey: e.target.value}}))} className={`border rounded px-2 py-2 text-xs placeholder-gray-500 ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-black/40 border-white/10 text-white'}`} placeholder="Optional for Web Mode" />
                  </div>
                  
                  {/* Endpoint for custom/openwebui */}
                  {(settings.aiConfig.provider === 'custom' || settings.aiConfig.provider === 'openwebui') && (
                     <div className="flex flex-col gap-1 mt-2 animate-fade-in">
                        <label className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Endpoint URL</label>
                        <input type="text" value={settings.aiConfig.endpoint} onChange={(e) => setSettings(prev => ({...prev, aiConfig: {...prev.aiConfig, endpoint: e.target.value}}))} className={`border rounded px-2 py-2 text-xs placeholder-gray-500 ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-black/40 border-white/10 text-white'}`} placeholder="http://localhost:3000" />
                     </div>
                  )}
                </div>
            </div>

            <div className={`flex justify-between p-4 border-t shrink-0 ${settings.theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-[#202020] border-white/10'}`}>
              <button onClick={() => setSettings(DEFAULT_SETTINGS)} className="text-xs text-gray-500 hover:text-red-400">Reset Defaults</button>
              <button onClick={saveSettings} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm">Save</button>
            </div>
            
            {/* Resize Handle */}
            <div 
               className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-500/20 z-50"
               onMouseDown={handleSettingsResizeDown}
            ></div>
          </div>
      )}

      {/* Nano Toolbar (Horizontal, Resizable, Draggable) */}
      {isNanoOpen && (
        <div 
          className="fixed z-[10000] flex flex-col rounded-lg shadow-2xl animate-fade-in overflow-hidden border"
          style={{ 
             left: nanoPos.x, top: nanoPos.y, width: nanoWidth, height: '60px',
             zIndex: getZIndex() + 1,
             backgroundColor: settings.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,30,0.95)',
             borderColor: getThemeBorder().split(' ')[2], // Extract color
             backdropFilter: 'blur(10px)'
          }}
          onMouseDown={handleNanoMouseDown}
        >
           {/* Handle */}
           <div className={`h-4 w-full cursor-move flex items-center justify-center opacity-50 bg-black/10`}>
              <div className="w-8 h-1 bg-current rounded-full"></div>
           </div>
           
           {/* Scrollable Buttons Area */}
           <div className="flex-1 flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider mr-2 opacity-50 shrink-0 select-none">Nano</span>
              {NANO_SHORTCUTS.map(sc => (
                 <button
                    key={sc.label}
                    onClick={() => { updateInput(inputBuffer + sc.code); playClickSound(); }}
                    className={`flex flex-col items-center justify-center px-3 py-1 rounded min-w-[50px] transition-colors ${settings.theme === 'light' ? 'hover:bg-gray-200 text-black' : 'hover:bg-white/20 text-white'} shrink-0`}
                    title={sc.desc}
                 >
                    <span className="text-xs font-semibold">{sc.short}</span>
                    <span className="text-[8px] opacity-60">{sc.code}</span>
                 </button>
              ))}
              {/* Close Button at End */}
              <div className="flex-1"></div>
              <button onClick={() => setIsNanoOpen(false)} className="px-2 hover:text-red-400 shrink-0">✕</button>
           </div>
           
           {/* Resize Handle */}
           <div 
             className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize hover:bg-blue-500/20 resize-handle z-50"
             onMouseDown={handleNanoResizeDown}
           ></div>
        </div>
      )}

      {/* KEYBOARD WIDGET */}
      <div 
        className="glass-panel fixed flex flex-col overflow-hidden animate-fade-in"
        style={{ 
           left: position.x, top: position.y,
           zIndex: getZIndex(),
           width: '950px', height: showTerminal ? '600px' : '380px',
           resize: isLocked ? 'none' : 'both', overflow: 'hidden',
           backgroundColor: getThemeBg(),
           border: getThemeBorder(),
           transition: 'background-color 0.3s'
        }}
      >
        <div className={`p-2 sm:p-4 backdrop-blur-3xl flex-1 flex flex-col relative w-full min-h-0 ${settings.theme === 'light' ? 'bg-white/50' : 'bg-transparent'}`}>
          <div className="flex flex-col gap-1 select-none flex-1 w-full h-full">
            {renderLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center w-full gap-1 flex-1 min-h-0">
                {row.map((keyConfig) => (
                  <KeyButton 
                    key={keyConfig.id} config={keyConfig} keyboardState={keyboardState} onPress={handleKeyPress}
                    fontScale={settings.fontScale} highContrast={settings.highContrast} theme={settings.theme}
                  />
                ))}
              </div>
            ))}
          </div>

          {notification && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-black px-4 py-2 rounded-full shadow-lg text-xs font-semibold z-50 pointer-events-none">
                {notification}
             </div>
          )}

          {(!settings.showBar || !settings.showInputPreview) && (
            <div className="absolute top-1 right-1 z-50 flex gap-2">
               <button onClick={() => setShowTerminal(!showTerminal)} className="p-1.5 rounded backdrop-blur-md bg-black/20 text-white hover:bg-black/40" title="Toggle Terminal">
                 <Icons.PowerShell />
               </button>
               <button onClick={handleUndo} className="p-1.5 rounded backdrop-blur-md bg-black/20 text-white hover:bg-black/40" title="Undo">
                 <Icons.Undo />
               </button>
               <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded backdrop-blur-md bg-black/20 text-white hover:bg-black/40" title="Settings">
                 <Icons.Settings />
               </button>
               <button onClick={() => setIsLocked(!isLocked)} className={`p-1.5 rounded backdrop-blur-md bg-black/20 hover:bg-black/40 ${isLocked ? 'text-red-400' : 'text-white'}`} title="Lock Position">
                 {isLocked ? <Icons.Lock /> : <Icons.Unlock />}
               </button>
            </div>
          )}
        </div>
        
        {/* Control Bar */}
        {settings.showBar && (
          <div className={`h-9 flex items-center justify-between px-3 border-t shrink-0 select-none cursor-grab active:cursor-grabbing ${settings.theme === 'light' ? 'bg-gray-100 border-gray-300 text-black' : (settings.theme === 'blue' ? 'bg-[#002b55] border-white/10 text-white' : 'bg-black/40 border-white/5 text-gray-300')}`} onMouseDown={handleMouseDown}>
             <div className="flex items-center gap-2 pointer-events-none">
               <span className="text-[10px] uppercase tracking-widest font-semibold opacity-70">Touch Keyboard</span>
             </div>
             
             <div className="flex gap-2">
               <button onClick={() => setShowTerminal(!showTerminal)} className="px-3 py-1 rounded text-[10px] font-bold border border-white/10 bg-white/5 hover:bg-white/10">
                 {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
               </button>
               <button onClick={handleUndo} className="px-2 py-1 rounded hover:bg-white/10"><Icons.Undo /></button>
               <button onClick={() => setIsSettingsOpen(true)} className="px-2 py-1 rounded hover:bg-white/10"><Icons.Settings /></button>
             </div>

             <div className="flex gap-3 items-center">
               <button onClick={() => setIsLocked(!isLocked)} className={`hover:text-white ${isLocked ? 'text-red-400' : ''}`}>{isLocked ? <Icons.Lock /> : <Icons.Unlock />}</button>
               <button onClick={() => setIsMinimized(true)} className="hover:text-white" title="Minimize to Top Bar">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"></line></svg>
               </button>
             </div>
          </div>
        )}

        {(!showTerminal && settings.showInputPreview) && (
            <div className={`h-8 shrink-0 w-full border-t flex items-center px-3 overflow-hidden ${settings.theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-black/20 border-white/5 text-green-400'}`}>
                <span className="text-sm font-mono whitespace-pre flex-1">{inputBuffer}<span className="animate-pulse">_</span></span>
            </div>
        )}

        {showTerminal && (
          <div className="h-48 shrink-0 w-full animate-fade-in relative z-10">
            <TerminalDisplay 
               lines={terminalLines} currentInput={inputBuffer} isAdmin={isAdminMode} isProcessing={isGenerating} currentPath={isAdminMode ? 'C:\\Windows\\System32' : 'C:\\Users\\User'} onToggleAdmin={() => setIsAdminMode(prev => !prev)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default App;