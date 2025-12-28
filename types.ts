import React from 'react';

export enum KeyType {
  NORMAL = 'NORMAL',
  MODIFIER = 'MODIFIER',
  ACTION = 'ACTION', // Enter, Backspace, Clear
  TOGGLE = 'TOGGLE', // Caps, Fn
  SPECIAL = 'SPECIAL' // PS Admin, AI, Nav/Nano
}

export interface KeyConfig {
  id: string;
  label: string | React.ReactNode;
  secondaryLabel?: string; // For shift characters like ! @ #
  fnLabel?: string | React.ReactNode; // Label shown when Fn is active
  fnId?: string; // ID sent when Fn is active
  type: KeyType;
  width?: number; // Relative width (1 is standard key)
  code?: string; // KeyboardEvent code
  action?: () => void;
  isActive?: boolean;
}

export interface KeyboardState {
  capsLock: boolean;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  win: boolean;
  fn: boolean;
}

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'perplexity' | 'openwebui' | 'openrouter' | 'custom';
export type Theme = 'dark' | 'light' | 'blue' | 'cyber';
export type WindowLayer = 'always-on-top' | 'standard' | 'background';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint: string; // Used for OpenWebUI, Custom, or overriding defaults
}

export interface AppSettings {
  fontScale: number;
  opacity: number;
  clickSound: boolean;
  highContrast: boolean;
  showBar: boolean;
  showInputPreview: boolean; // Toggle for the text input bar
  aiConfig: AIConfig;
  theme: Theme;
  windowLayer: WindowLayer;
}