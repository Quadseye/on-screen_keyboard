import React from 'react';
import { KeyConfig, KeyType } from './types';

// SVGs for special keys
export const Icons = {
  Windows: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.44l10.86-1.5v10.03H0V3.44zm11.96-1.63L24 0v11.97H11.96V1.81zm0 11.23H24v10.15l-12.04-1.8V13.04zM0 13.04h10.86v8.46L0 20V13.04z" />
    </svg>
  ),
  Backspace: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
      <line x1="18" y1="9" x2="12" y2="15"></line>
      <line x1="12" y1="9" x2="18" y2="15"></line>
    </svg>
  ),
  Enter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 10 4 15 9 20"></polyline>
      <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
    </svg>
  ),
  Shift: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18H9v-5H5l7-7 7 7h-4v5z"></path>
    </svg>
  ),
  PowerShell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  ),
  Clear: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <circle cx="12" cy="12" r="10"></circle>
       <line x1="15" y1="9" x2="9" y2="15"></line>
       <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  AI: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.2"/>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Unlock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
  ),
  Mic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
       <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
       <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  ),
  ArrowUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  ),
  ArrowDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  Paste: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
  Undo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6"></path>
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
    </svg>
  ),
  Cut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"></circle>
      <circle cx="6" cy="18" r="3"></circle>
      <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
      <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
      <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
    </svg>
  ),
  SelectAll: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 2"></rect>
       <path d="M9 9h6v6H9z" fill="currentColor" fillOpacity="0.3"></path>
    </svg>
  ),
  Clipboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <line x1="9" y1="18" x2="13" y2="18" />
    </svg>
  ),
  LeftClick: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="2" width="12" height="20" rx="6"></rect>
      <line x1="6" y1="10" x2="18" y2="10"></line>
      <line x1="12" y1="2" x2="12" y2="10"></line>
      <circle cx="9" cy="6" r="1.5" fill="currentColor"></circle>
    </svg>
  ),
  RightClick: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="2" width="12" height="20" rx="6"></rect>
      <line x1="6" y1="10" x2="18" y2="10"></line>
      <line x1="12" y1="2" x2="12" y2="10"></line>
      <circle cx="15" cy="6" r="1.5" fill="currentColor"></circle>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Taskbar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  CharMap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7M4 7L12 3L20 7M4 7H20" />
      <text x="8" y="16" fontSize="8" fill="currentColor" stroke="none">Ω</text>
    </svg>
  ),
  Nano: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
      <rect x="2" y="2" width="20" height="20" rx="2" strokeOpacity="0.5"></rect>
    </svg>
  ),
  CAD: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  ),
  Nav: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
    </svg>
  ),
  DragHandle: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="opacity-50">
       <circle cx="8" cy="4" r="2" />
       <circle cx="8" cy="12" r="2" />
       <circle cx="8" cy="20" r="2" />
       <circle cx="16" cy="4" r="2" />
       <circle cx="16" cy="12" r="2" />
       <circle cx="16" cy="20" r="2" />
    </svg>
  )
};

export const ProviderIcons = {
  OpenAI: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9723V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2298V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4593a.7948.7948 0 0 0-.3927.6813zm1.0916-4.3665l3.2002-1.8542 3.2002 1.8542v3.7084l-3.2002 1.8542-3.2002-1.8542z"/>
    </svg>
  ),
  Gemini: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
       <path d="M11.63 2.14a.86.86 0 0 1 1.6 0c.92 3.93 4.14 7.21 8.07 8.13a.86.86 0 0 1 0 1.61c-3.93.92-7.15 4.2-8.07 8.13a.86.86 0 0 1-1.61 0c-.92-3.93-4.14-7.21-8.07-8.13a.86.86 0 0 1 0-1.6c3.93-.93 7.15-4.21 8.08-8.14zM5.5 16.5a.6.6 0 0 1 1 0c.5 1.7 1.8 3 3.5 3.5a.6.6 0 0 1 0 1c-1.7.5-3 1.8-3.5 3.5a.6.6 0 0 1-1 0c-.5-1.7-1.8-3-3.5-3.5a.6.6 0 0 1 0-1c1.7-.5 3-1.8 3.5-3.5z"/>
    </svg>
  ),
  Claude: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 8h10M7 12h8M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Copilot: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  Perplexity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  OpenRouter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
    </svg>
  ),
  OpenWebUI: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8m-4-4v8" />
    </svg>
  ),
  Custom: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
};

// Map Anthropic to Claude Icon
(ProviderIcons as any).Anthropic = ProviderIcons.Claude;

export const AI_WEB_LINKS = [
  { name: 'ChatGPT', url: 'https://chatgpt.com', icon: ProviderIcons.OpenAI, desc: 'OpenAI' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: ProviderIcons.Gemini, desc: 'Google' },
  { name: 'Claude', url: 'https://claude.ai', icon: ProviderIcons.Claude, desc: 'Anthropic' },
  { name: 'Copilot', url: 'https://copilot.microsoft.com', icon: ProviderIcons.Copilot, desc: 'Microsoft' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: ProviderIcons.Perplexity, desc: 'Search' },
  { name: 'Open WebUI', url: 'http://localhost:3000', icon: ProviderIcons.OpenWebUI, desc: 'Self-Hosted' },
];

export const NANO_SHORTCUTS = [
  { label: 'Get Help', code: '^G', desc: 'F1', short: 'Help' },
  { label: 'Write Out', code: '^O', desc: 'F3', short: 'Save' },
  { label: 'Read File', code: '^R', desc: 'F5', short: 'Read' },
  { label: 'Where Is', code: '^W', desc: 'F6', short: 'Find' },
  { label: 'Replace', code: '^\\', desc: 'F4', short: 'Repl' },
  { label: 'Cut', code: '^K', desc: 'F9', short: 'Cut' },
  { label: 'Paste (Uncut)', code: '^U', desc: 'F10', short: 'Paste' },
  { label: 'Justify', code: '^J', desc: 'F4', short: 'Just' },
  { label: 'To Line', code: '^_', desc: 'F7', short: 'GoTo' },
  { label: 'Mark', code: 'M-A', desc: 'M-A', short: 'Mark' },
  { label: 'Prev', code: 'M-U', desc: 'M-U', short: 'Undo' },
  { label: 'Next', code: 'M-E', desc: 'M-E', short: 'Redo' },
  { label: 'Exit', code: '^X', desc: 'F2', short: 'Exit' },
];

export const getLayout = (): KeyConfig[][] => [
  [
    { id: 'Esc', label: 'Esc', type: KeyType.ACTION, width: 1 },
    { id: 'Digit1', label: '1', secondaryLabel: '!', fnLabel: 'F1', fnId: 'F1', type: KeyType.NORMAL },
    { id: 'Digit2', label: '2', secondaryLabel: '@', fnLabel: 'F2', fnId: 'F2', type: KeyType.NORMAL },
    { id: 'Digit3', label: '3', secondaryLabel: '#', fnLabel: 'F3', fnId: 'F3', type: KeyType.NORMAL },
    { id: 'Digit4', label: '4', secondaryLabel: '$', fnLabel: 'F4', fnId: 'F4', type: KeyType.NORMAL },
    { id: 'Digit5', label: '5', secondaryLabel: '%', fnLabel: 'F5', fnId: 'F5', type: KeyType.NORMAL },
    { id: 'Digit6', label: '6', secondaryLabel: '^', fnLabel: 'F6', fnId: 'F6', type: KeyType.NORMAL },
    { id: 'Digit7', label: '7', secondaryLabel: '&', fnLabel: 'F7', fnId: 'F7', type: KeyType.NORMAL },
    { id: 'Digit8', label: '8', secondaryLabel: '*', fnLabel: 'F8', fnId: 'F8', type: KeyType.NORMAL },
    { id: 'Digit9', label: '9', secondaryLabel: '(', fnLabel: 'F9', fnId: 'F9', type: KeyType.NORMAL },
    { id: 'Digit0', label: '0', secondaryLabel: ')', fnLabel: 'F10', fnId: 'F10', type: KeyType.NORMAL },
    { id: 'Minus', label: '-', secondaryLabel: '_', fnLabel: 'F11', fnId: 'F11', type: KeyType.NORMAL },
    { id: 'Equal', label: '=', secondaryLabel: '+', fnLabel: 'F12', fnId: 'F12', type: KeyType.NORMAL },
    { id: 'Backspace', label: <Icons.Backspace />, type: KeyType.ACTION, width: 2.0 },
    { id: 'CAD', label: 'CAD', secondaryLabel: 'Del', type: KeyType.SPECIAL, width: 1.0 },
  ],
  [
    { id: 'Tab', label: 'Tab', type: KeyType.ACTION, width: 2.0 },
    { id: 'KeyQ', label: 'q', type: KeyType.NORMAL },
    { id: 'KeyW', label: 'w', type: KeyType.NORMAL },
    { id: 'KeyE', label: 'e', type: KeyType.NORMAL },
    { id: 'KeyR', label: 'r', type: KeyType.NORMAL },
    { id: 'KeyT', label: 't', type: KeyType.NORMAL },
    { id: 'KeyY', label: 'y', type: KeyType.NORMAL },
    { id: 'KeyU', label: 'u', type: KeyType.NORMAL },
    { id: 'KeyI', label: 'i', type: KeyType.NORMAL },
    { id: 'KeyO', label: 'o', type: KeyType.NORMAL },
    { id: 'KeyP', label: 'p', type: KeyType.NORMAL },
    { id: 'BracketLeft', label: '[', secondaryLabel: '{', type: KeyType.NORMAL },
    { id: 'BracketRight', label: ']', secondaryLabel: '}', type: KeyType.NORMAL },
    { id: 'Backslash', label: '\\', secondaryLabel: '|', type: KeyType.NORMAL, width: 1.5 },
  ],
  [
    { id: 'CapsLock', label: 'Caps', type: KeyType.TOGGLE, width: 2.0 },
    { id: 'KeyA', label: 'a', type: KeyType.NORMAL },
    { id: 'KeyS', label: 's', type: KeyType.NORMAL },
    { id: 'KeyD', label: 'd', type: KeyType.NORMAL },
    { id: 'KeyF', label: 'f', type: KeyType.NORMAL },
    { id: 'KeyG', label: 'g', type: KeyType.NORMAL },
    { id: 'KeyH', label: 'h', type: KeyType.NORMAL },
    { id: 'KeyJ', label: 'j', type: KeyType.NORMAL },
    { id: 'KeyK', label: 'k', type: KeyType.NORMAL },
    { id: 'KeyL', label: 'l', type: KeyType.NORMAL },
    { id: 'Semicolon', label: ';', secondaryLabel: ':', type: KeyType.NORMAL },
    { id: 'Quote', label: "'", secondaryLabel: '"', type: KeyType.NORMAL },
    { id: 'Enter', label: <Icons.Enter />, type: KeyType.ACTION, width: 2.5 },
  ],
  [
    { id: 'ShiftLeft', label: 'Shift', type: KeyType.MODIFIER, width: 2.25 },
    { id: 'KeyZ', label: 'z', type: KeyType.NORMAL },
    { id: 'KeyX', label: 'x', type: KeyType.NORMAL },
    { id: 'KeyC', label: 'c', type: KeyType.NORMAL },
    { id: 'KeyV', label: 'v', type: KeyType.NORMAL },
    { id: 'KeyB', label: 'b', type: KeyType.NORMAL },
    { id: 'KeyN', label: 'n', type: KeyType.NORMAL },
    { id: 'KeyM', label: 'm', type: KeyType.NORMAL },
    { id: 'Comma', label: ',', secondaryLabel: '<', type: KeyType.NORMAL },
    { id: 'Period', label: '.', secondaryLabel: '>', type: KeyType.NORMAL },
    { id: 'Slash', label: '/', secondaryLabel: '?', type: KeyType.NORMAL },
    { id: 'Cut', label: <Icons.Cut />, type: KeyType.ACTION, width: 0.9 },
    { id: 'Copy', label: <Icons.Copy />, type: KeyType.ACTION, width: 0.9 },
    { id: 'Paste', label: <Icons.Paste />, type: KeyType.ACTION, width: 0.9 },
    { id: 'SelectAll', label: <Icons.SelectAll />, type: KeyType.ACTION, width: 0.9 },
    { id: 'ArrowUp', label: <Icons.ArrowUp />, type: KeyType.NORMAL, width: 0.9 },
    { id: 'ShiftRight', label: 'Shift', type: KeyType.MODIFIER, width: 1 },
    { id: 'AI', label: <Icons.AI/>, type: KeyType.SPECIAL, width: 1.25, isActive: false },
  ],
  [
    { id: 'Fn', label: 'Fn', type: KeyType.TOGGLE, width: 1.0 },
    { id: 'ControlLeft', label: 'Ctrl', type: KeyType.MODIFIER, width: 1.1 },
    { id: 'Win', label: <Icons.Windows />, type: KeyType.MODIFIER, width: 1.1 },
    { id: 'AltLeft', label: 'Alt', type: KeyType.MODIFIER, width: 1.1 },
    { id: 'Space', label: '', type: KeyType.NORMAL, width: 2.2 },
    { id: 'Mic', label: <Icons.Mic />, type: KeyType.TOGGLE, width: 0.9 },
    { id: 'Clipboard', label: <Icons.Clipboard />, type: KeyType.SPECIAL, width: 0.9 },
    { id: 'Nano', label: <Icons.Nano />, type: KeyType.SPECIAL, width: 0.9 },
    { id: 'Settings', label: <Icons.Settings />, type: KeyType.SPECIAL, width: 0.9 },
    { id: 'LeftClick', label: <Icons.LeftClick />, type: KeyType.ACTION, width: 0.9 },
    { id: 'RightClick', label: <Icons.RightClick />, type: KeyType.ACTION, width: 0.9 },
    { id: 'ArrowLeft', label: <Icons.ArrowLeft />, type: KeyType.NORMAL, width: 0.9 },
    { id: 'ArrowDown', label: <Icons.ArrowDown />, type: KeyType.NORMAL, width: 0.9 },
    { id: 'ArrowRight', label: <Icons.ArrowRight />, type: KeyType.NORMAL, width: 0.9 },
    { id: 'PSAdmin', label: <Icons.PowerShell/>, type: KeyType.SPECIAL, width: 1.0 },
  ]
];