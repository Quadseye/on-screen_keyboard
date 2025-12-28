import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

const SYSTEM_PROMPT = `You are an expert Windows System Administrator.
Convert the following natural language request into a precise, safe Windows PowerShell command. 
Do not include any markdown formatting (like \`\`\`), explanation, or preamble. 
Only return the executable command string.
If the request is dangerous or malicious, return "# Error: Unsafe request denied".`;

export const generatePowerShellCommand = async (prompt: string, config: AIConfig): Promise<string> => {
  const { provider, apiKey, model, endpoint } = config;

  if (!apiKey && provider !== 'custom' && provider !== 'openwebui') {
    // Check if we have a fallback env key for Gemini, otherwise error
    if (provider === 'gemini' && !process.env.API_KEY) {
      return "# Error: API Key is missing. Please configure it in Settings.";
    }
    if (provider !== 'gemini') {
       return `# Error: ${provider} API Key is missing. Please configure it in Settings.`;
    }
  }

  const finalApiKey = apiKey || (provider === 'gemini' ? process.env.API_KEY : '');

  try {
    switch (provider) {
      case 'gemini':
        return await callGemini(prompt, finalApiKey, model);
      case 'anthropic':
        return await callAnthropic(prompt, finalApiKey, model);
      case 'openai':
        return await callOpenAICompatible(prompt, finalApiKey, model, 'https://api.openai.com/v1/chat/completions');
      case 'perplexity':
        return await callOpenAICompatible(prompt, finalApiKey, model, 'https://api.perplexity.ai/chat/completions');
      case 'openrouter':
        return await callOpenAICompatible(prompt, finalApiKey, model, 'https://openrouter.ai/api/v1/chat/completions', {
          'HTTP-Referer': window.location.href,
          'X-Title': 'Win11 Virtual Keyboard'
        });
      case 'openwebui':
      case 'custom':
        if (!endpoint) return "# Error: Endpoint URL is required for Custom/Open WebUI.";
        return await callOpenAICompatible(prompt, finalApiKey, model, endpoint);
      default:
        return "# Error: Unknown Provider";
    }
  } catch (error: any) {
    console.error(`${provider} API Error:`, error);
    return `# Error: Failed to generate command via ${provider}. ${error.message || ''}`;
  }
};

// --- Gemini Implementation ---
async function callGemini(prompt: string, apiKey: string | undefined, model: string) {
  if (!apiKey) return "# Error: Gemini API Key missing";
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: model || 'gemini-3-flash-preview',
    contents: `${SYSTEM_PROMPT}\n\nRequest: "${prompt}"`,
  });

  return response.text?.trim() || "# Error: No response from Gemini";
}

// --- OpenAI / Perplexity / Custom / OpenRouter Implementation ---
async function callOpenAICompatible(prompt: string, apiKey: string | undefined, model: string, url: string, extraHeaders: any = {}) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const body = {
    model: model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API returned ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return content?.trim() || "# Error: Empty response from API";
}

// --- Anthropic Implementation ---
async function callAnthropic(prompt: string, apiKey: string | undefined, model: string) {
  if (!apiKey) return "# Error: Anthropic API Key missing";

  // Note: Browser-based calls to Anthropic often fail CORS unless proxied.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      // 'dangerously-allow-browser': 'true' // Sometimes needed if utilizing client SDK, but raw fetch hits CORS
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (err.includes("CORS")) {
       throw new Error("CORS Error: Browser cannot access Anthropic directly. Use a proxy.");
    }
    throw new Error(`API returned ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  return content?.trim() || "# Error: Empty response from Anthropic";
}
