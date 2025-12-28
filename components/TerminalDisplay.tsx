import React, { useEffect, useRef } from 'react';
import { TerminalLine } from '../types';

interface TerminalDisplayProps {
  lines: TerminalLine[];
  currentInput: string;
  isAdmin: boolean;
  isProcessing: boolean;
  currentPath: string;
  onToggleAdmin: () => void;
}

const TerminalDisplay: React.FC<TerminalDisplayProps> = React.memo(({ 
  lines, 
  currentInput, 
  isAdmin, 
  isProcessing, 
  currentPath,
  onToggleAdmin 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, currentInput]);

  return (
    <div className="flex flex-col w-full h-full bg-[#0c0c0c] text-gray-200 font-mono text-sm overflow-hidden border-t border-white/10">
      {/* Title Bar */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs select-none transition-colors duration-300 ${isAdmin ? 'bg-red-900/60 text-red-100' : 'bg-[#1f1f1f] text-gray-300'}`}>
        <div className="flex items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/PowerShell_5.0_icon.png" 
            alt="PS" 
            className="w-4 h-4 mr-2" 
          />
          <span>{isAdmin ? 'Administrator: Windows PowerShell' : 'Windows PowerShell'}</span>
        </div>
        
        {/* Admin Toggle */}
        <div className="flex items-center gap-2">
           <span className="text-[10px] opacity-70">{isAdmin ? 'Admin' : 'User'}</span>
           <button 
             onClick={onToggleAdmin}
             className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isAdmin ? 'bg-red-500' : 'bg-blue-600'}`}
             title="Toggle Administrator Mode"
           >
             <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${isAdmin ? 'translate-x-4' : 'translate-x-0'}`}></div>
           </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap"
        ref={scrollRef}
        style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
      >
        <div className="mb-4 text-gray-400">
          Windows PowerShell<br/>
          Copyright (C) Microsoft Corporation. All rights reserved.<br/>
          <br/>
          Try the new cross-platform PowerShell https://aka.ms/pscore6<br/>
          <br/>
        </div>

        {lines.map((line, idx) => (
          <div key={idx} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : line.type === 'info' ? 'text-cyan-400' : 'text-gray-100'}`}>
            {line.content}
          </div>
        ))}

        {/* Current Prompt */}
        <div className="flex">
          <span className="text-white mr-2">
            {`PS ${currentPath}>`}
          </span>
          <span className="text-white break-all">
            {currentInput}
            {/* Blinking cursor */}
            <span className="inline-block w-2 h-4 bg-gray-200 ml-0.5 animate-pulse align-middle"></span>
          </span>
        </div>
        
        {isProcessing && (
           <div className="text-cyan-500 mt-2 animate-pulse">Thinking...</div>
        )}
      </div>
    </div>
  );
});

export default TerminalDisplay;