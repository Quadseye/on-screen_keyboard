import React, { useRef, useEffect } from 'react';
import { KeyConfig, KeyType, KeyboardState, Theme } from '../types';
import { Icons } from '../constants';

interface KeyButtonProps {
  config: KeyConfig;
  keyboardState: KeyboardState;
  onPress: (keyId: string, config: KeyConfig) => void;
  fontScale?: number;
  highContrast?: boolean;
  theme?: Theme;
}

const KeyButton: React.FC<KeyButtonProps> = ({ config, keyboardState, onPress, fontScale = 1, highContrast = false, theme = 'dark' }) => {
  const { id, label, secondaryLabel, fnLabel, type, width = 1, isActive } = config;

  // Refs for repeat logic
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const onPressRef = useRef(onPress);

  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  useEffect(() => {
    return () => stopRepeat();
  }, []);

  const stopRepeat = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'mousedown') {
      e.preventDefault(); 
    }
    onPressRef.current(id, config);

    const isRepeatable = 
      type === KeyType.NORMAL || 
      id === 'Backspace' || 
      id === 'Enter' || 
      id === 'Tab';

    const isExcluded = 
      id === 'Copy' || 
      id === 'Paste' || 
      id === 'Esc' || 
      id === 'Clear';

    if (isRepeatable && !isExcluded) {
      stopRepeat(); 
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
           onPressRef.current(id, config);
        }, 50); 
      }, 500);
    }
  };

  const handleEnd = () => {
    stopRepeat();
  };

  // Determine Active State Styles
  let activeStyles = '';
  
  // Colors based on themes for active keys (Caps, Shift held, etc)
  const getActiveColor = () => {
    if (highContrast) return 'bg-yellow-400 text-black border-4 border-white';
    if (theme === 'light') return 'bg-blue-500 text-white shadow-inner';
    if (theme === 'blue') return 'bg-[#0078d7] text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]';
    if (theme === 'cyber') return 'bg-pink-600 text-white border border-pink-400 shadow-[0_0_10px_#db2777]';
    return 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'; // Dark/Default
  };
  
  const getToggleColor = () => {
     if (highContrast) return 'bg-cyan-400 text-black border-4 border-white';
     if (theme === 'light') return 'bg-purple-500 text-white';
     if (theme === 'blue') return 'bg-[#5e35b1] text-white';
     if (theme === 'cyber') return 'bg-purple-600 text-white border border-purple-400 shadow-[0_0_10px_#9333ea]';
     return 'bg-purple-600 text-white border-purple-400';
  };

  const getAlertColor = () => {
     if (highContrast) return 'bg-red-600 text-white border-4 border-white animate-pulse';
     return 'bg-red-600 text-white animate-pulse';
  }

  // Check state
  if (id === 'CapsLock' && keyboardState.capsLock) activeStyles = getActiveColor();
  else if ((id === 'ShiftLeft' || id === 'ShiftRight') && keyboardState.shift) activeStyles = getActiveColor();
  else if ((id === 'ControlLeft' || id === 'ControlRight') && keyboardState.ctrl) activeStyles = getActiveColor();
  else if ((id === 'AltLeft' || id === 'AltRight') && keyboardState.alt) activeStyles = getActiveColor();
  else if (id === 'Fn' && keyboardState.fn) activeStyles = getToggleColor();
  else if (id === 'Nav' && isActive) activeStyles = getToggleColor();
  else if (isActive) activeStyles = getAlertColor();

  // Base Key Styles
  const baseStyles = `
    relative flex flex-col items-center justify-center
    h-full m-[2px] rounded-md transition-all duration-100 select-none
    font-medium
    active:scale-95
  `;
  
  // Theme Styles (Idle State)
  let idleStyles = '';
  if (highContrast) {
    idleStyles = 'bg-black text-yellow-300 border-2 border-yellow-300 hover:bg-gray-800';
  } else if (theme === 'light') {
    idleStyles = 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-200';
  } else if (theme === 'blue') {
    idleStyles = 'bg-[#1a1a1a] text-white border border-[#333] hover:bg-[#333] hover:border-[#555]';
  } else if (theme === 'cyber') {
    idleStyles = 'bg-black/80 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-900/20 hover:border-cyan-500 hover:shadow-[0_0_8px_rgba(6,182,212,0.4)]';
  } else {
    // Dark / Default
    idleStyles = 'bg-white/10 hover:bg-white/20 text-white border border-white/5 shadow-sm';
  }

  const finalStyles = activeStyles || idleStyles;

  // Text Colors for sub-labels
  const getSubLabelColor = (isShifted: boolean) => {
    if (highContrast) return isShifted ? 'text-white' : 'text-yellow-600';
    if (theme === 'light') return isShifted ? 'text-blue-600' : 'text-gray-400';
    if (theme === 'cyber') return isShifted ? 'text-pink-400' : 'text-cyan-700';
    // Dark/Blue
    return isShifted ? 'text-white' : 'text-gray-500';
  }

  const getFnLabelColor = () => {
    if (highContrast) return 'text-cyan-600';
    if (theme === 'light') return 'text-purple-600';
    if (theme === 'cyber') return 'text-purple-400';
    return 'text-purple-400';
  }

  // Render label content
  const renderLabel = () => {
    // Fn Layer Logic
    if (keyboardState.fn && fnLabel) {
       return <span className={`${highContrast ? 'text-cyan-300' : (theme === 'light' ? 'text-purple-700' : 'text-purple-300')} font-bold`}>{fnLabel}</span>;
    }

    // Ctrl Shortcut Icons
    if (keyboardState.ctrl && !keyboardState.alt && !keyboardState.win) {
      if (id === 'KeyA') return <div className="flex flex-col items-center justify-center"><Icons.SelectAll /><span className="text-[9px] leading-none mt-0.5">All</span></div>;
      if (id === 'KeyC') return <div className="flex flex-col items-center justify-center"><Icons.Copy /><span className="text-[9px] leading-none mt-0.5">Copy</span></div>;
      if (id === 'KeyV') return <div className="flex flex-col items-center justify-center"><Icons.Paste /><span className="text-[9px] leading-none mt-0.5">Paste</span></div>;
      if (id === 'KeyX') return <div className="flex flex-col items-center justify-center"><Icons.Cut /><span className="text-[9px] leading-none mt-0.5">Cut</span></div>;
      if (id === 'KeyZ') return <div className="flex flex-col items-center justify-center"><Icons.Undo /><span className="text-[9px] leading-none mt-0.5">Undo</span></div>;
    }

    if (typeof label !== 'string') return label;
    
    // Letter keys
    if (label.length === 1 && /[a-z]/i.test(label)) {
      return keyboardState.capsLock !== keyboardState.shift ? label.toUpperCase() : label.toLowerCase();
    }
    
    // Keys with secondary characters
    if (secondaryLabel) {
       return (
         <>
           <span 
             className={`absolute top-1 right-1.5 font-bold ${getSubLabelColor(true)}`}
             style={{ fontSize: `${10 * fontScale}px`, opacity: keyboardState.shift ? 1 : 0.7 }}
           >
             {secondaryLabel}
           </span>
           <span 
             className={`absolute bottom-1.5 ${activeStyles ? 'text-white' : (theme === 'light' ? 'text-gray-900' : (theme === 'cyber' ? 'text-cyan-300' : 'text-white'))}`}
           >
             {label}
           </span>
           {!keyboardState.fn && fnLabel && (
              <span 
                className={`absolute top-1 left-1.5 opacity-60 ${getFnLabelColor()}`}
                style={{ fontSize: `${9 * fontScale}px` }}
              >
                {fnLabel}
              </span>
           )}
         </>
       )
    }

    return label;
  };

  return (
    <button
      className={`${baseStyles} ${finalStyles}`}
      style={{ 
        flexGrow: width, 
        flexBasis: `${width * 40}px`,
        fontSize: `${14 * fontScale}px`
      }} 
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {renderLabel()}
    </button>
  );
};

export default React.memo(KeyButton);