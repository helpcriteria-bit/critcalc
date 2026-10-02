import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getOfflineTutorResponse } from '../utils/mathTutorEngine';
import { CANVAS_TOOLS } from '../canvas/canvasTools';
import { getCanvasState } from '../canvas/canvasActions';

const API_BASE = 'https://api.groq.com/openai/v1';
const PLACEHOLDER_KEYS = ['', 'apikeyhere', 'your_key_here'];

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const FALLBACK_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Math & Tools)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fastest)' }
];
const MODEL_LABELS = Object.fromEntries(FALLBACK_MODELS.map((m) => [m.id, m.name]));
const NOT_CHAT = /whisper|tts|orpheus|guard|safeguard|embed|playai/i;

const BASE_SYSTEM_PROMPT =
  'You are a sharp, friendly, and expert maths & geometry tutor for a Class 10 student. ' +
  'You have full interactive access to a 2D geometry canvas via provided tools.\n\n' +
  'CANVAS SYSTEM & DRAWING RULES:\n' +
  '1. Coordinate system: Origin (0, 0) is at the center of the canvas. Coordinates are in centimeters (cm). ' +
  'Positive X goes right, positive Y goes UP.\n' +
  '2. DRAW INSTEAD OF DESCRIBING: When the student asks to draw, construct, show, or illustrate any geometric figure ' +
  '(e.g., "draw a 3-4-5 triangle", "draw a regular pentagon", "draw circle radius 4"), ' +
  'you MUST call the drawing tools to draw the figure on the canvas rather than merely describing it in text! ' +
  'Also draw when a visual figure clearly helps explain a concept. Only draw when asked or when a figure clearly helps.\n' +
  '3. POINT LABELS: Always label points (A, B, C...) or use clear descriptive labels so the student can follow along.\n' +
  '4. STEP-BY-STEP EXPLANATION: After executing canvas actions, provide a clear, numbered step-by-step mathematical explanation ' +
  'in your text response. Wrap any math expression in backticks like `x² + y²` or `AB = 6 cm`.\n' +
  '5. REUSING EXISTING OBJECTS: When asked to extend or add to existing figures (e.g. "now draw perpendicular from C to AB"), ' +
  'inspect the CURRENT CANVAS STATE below and reuse the existing points and labels ("A", "B", "C") instead of creating duplicates.\n' +
  '6. CONFIRMATION FOR DESTRUCTIVE ACTIONS: If the student asks to clear the canvas or delete an object, ' +
  'call clear_canvas or delete_object. The interface will prompt the student with a confirmation bar.';

function buildSystemPrompt(geoObjects = [], gridSettings = {}) {
  const canvasState = getCanvasState(geoObjects, gridSettings);
  let summary = 'The canvas is currently empty.';
  if (canvasState.objects.length > 0) {
    summary = `Current canvas objects (${canvasState.totalObjects} total, showing ${canvasState.objects.length}):\n${JSON.stringify(canvasState.objects)}`;
  }
  return `${BASE_SYSTEM_PROMPT}\n\nCURRENT CANVAS STATE:\n${summary}`;
}

export function isValidKey(key) {
  const k = (key || '').trim();
  return !PLACEHOLDER_KEYS.includes(k) && k.length >= 20;
}

class GroqError extends Error {
  constructor(kind, message, { status, retryAfter } = {}) {
    super(message);
    this.kind = kind; // invalid-key | model | rate-limit | server | network | timeout
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function toGroqError(res) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.error?.message || '';
  } catch (_) {}
  const retryAfter = Number(res.headers.get('retry-after')) || 0;
  const s = res.status;
  if (s === 401 || s === 403)
    return new GroqError('invalid-key', 'Groq rejected the API key. Check that it is correct and active.', { status: s });
  if (s === 429)
    return new GroqError('rate-limit', 'Groq rate limit reached. Retrying shortly.', { status: s, retryAfter });
  if (s === 404 || (s === 400 && /model|decommission/i.test(detail)))
    return new GroqError('model', detail || 'This model is not available on Groq.', { status: s });
  if (s >= 500) return new GroqError('server', `Groq server error (${s}).`, { status: s });
  return new GroqError('server', detail || `Groq returned ${s}.`, { status: s });
}

async function timedFetch(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new GroqError('timeout', 'Groq took too long to respond.');
    throw new GroqError('network', 'Cannot reach Groq. Check your internet connection.');
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Non-streaming completion call with optional tool definitions
async function callChatOnce({ key, model, messages, tools, tool_choice }) {
  const body = {
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.3
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = tool_choice || 'auto';
  }

  const res = await timedFetch(
    `${API_BASE}/chat/completions`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    25000
  );
  if (!res.ok) throw await toGroqError(res);
  return await res.json();
}

// Streams one completion. Resolves with the number of tokens delivered.
async function streamOnce({ key, model, messages, onToken }) {
  const res = await timedFetch(
    `${API_BASE}/chat/completions`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.6, stream: true })
    },
    20000
  );
  if (!res.ok) throw await toGroqError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let count = 0;
  let finished = false;

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith(':')) continue;
      if (line === 'data: [DONE]') {
        finished = true;
        break;
      }
      if (line.startsWith('data: ')) {
        try {
          const token = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
          if (token) {
            count += 1;
            onToken(token);
          }
        } catch (_) {
          /* ignore partial chunk */
        }
      }
    }
  }
  return count;
}

export function useGroq() {
  const {
    groqKey,
    aiModel,
    setAiModel,
    geoObjects,
    gridSettings,
    allowAiDraw,
    applyAiBatch
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [connection, setConnection] = useState({
    status: isValidKey(groqKey) ? 'checking' : 'no-key',
    message: ''
  });

  const keyRef = useRef(groqKey);
  keyRef.current = groqKey;

  const geoObjectsRef = useRef(geoObjects);
  geoObjectsRef.current = geoObjects;

  const gridSettingsRef = useRef(gridSettings);
  gridSettingsRef.current = gridSettings;

  const allowAiDrawRef = useRef(allowAiDraw);
  allowAiDrawRef.current = allowAiDraw;

  // Health check: validates key and loads live model list
  const checkConnection = useCallback(async () => {
    const key = keyRef.current;
    if (!isValidKey(key)) {
      setConnection({ status: 'no-key', message: 'No API key set.' });
      return false;
    }
    try {
      const res = await timedFetch(`${API_BASE}/models`, { headers: { Authorization: `Bearer ${key.trim()}` } }, 8000);
      if (!res.ok) throw await toGroqError(res);
      const data = await res.json();
      const ids = (data.data || []).map((m) => m.id).filter((id) => !NOT_CHAT.test(id)).sort();
      if (ids.length) {
        setModels(ids.map((id) => ({ id, name: MODEL_LABELS[id] || id })));
        setAiModel((current) =>
          ids.includes(current)
            ? current
            : ids.includes(DEFAULT_MODEL)
            ? DEFAULT_MODEL
            : ids[0]
        );
      }
      setConnection({ status: 'online', message: '' });
      return true;
    } catch (e) {
      setConnection({ status: e.kind === 'invalid-key' ? 'invalid-key' : 'offline', message: e.message });
      return false;
    }
  }, [setAiModel]);

  useEffect(() => {
    setConnection((c) => ({ ...c, status: isValidKey(groqKey) ? 'checking' : 'no-key' }));
    checkConnection();
    const interval = setInterval(checkConnection, 60000);
    const onBack = () => checkConnection();
    window.addEventListener('online', onBack);
    document.addEventListener('visibilitychange', onBack);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onBack);
      document.removeEventListener('visibilitychange', onBack);
    };
  }, [groqKey, checkConnection]);

  const sendMessage = useCallback(
    async (userText, history = [], onToken) => {
      setIsLoading(true);
      let offlineReason = 'No API key set.';

      try {
        const key = (keyRef.current || '').trim();
        const canUseLiveGroq = isValidKey(key);

        if (canUseLiveGroq) {
          const sysPrompt = buildSystemPrompt(geoObjectsRef.current, gridSettingsRef.current);
          const messages = [
            { role: 'system', content: sysPrompt },
            ...history
              .filter((m) => !m.isError && !m.isOffline)
              .slice(-12)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText }
          ];

          // Priority chain: llama-3.3-70b-versatile for tool calling, then user model, then fallbacks
          const chain = [
            'llama-3.3-70b-versatile',
            aiModel || DEFAULT_MODEL,
            ...models.map((m) => m.id)
          ].filter((id, i, a) => id && a.indexOf(id) === i).slice(0, 4);

          let delivered = 0;
          const counted = (t) => {
            delivered += 1;
            onToken(t);
          };

          outer: for (const model of chain) {
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                let conversation = [...messages];
                let drewAnything = false;

                // Multi-step tool-calling agent loop (Max 8 iterations)
                for (let iter = 0; iter < 8; iter++) {
                  const useTools = allowAiDrawRef.current;
                  const chatResp = await callChatOnce({
                    key,
                    model,
                    messages: conversation,
                    tools: useTools ? CANVAS_TOOLS : undefined,
                    tool_choice: useTools ? 'auto' : undefined
                  });

                  const choice = chatResp?.choices?.[0];
                  if (!choice) throw new GroqError('server', 'Groq returned no choice.');

                  const assistantMsg = choice.message || {};
                  const toolCalls = assistantMsg.tool_calls || [];

                  // If no tools were called, stream final explanation
                  if (toolCalls.length === 0) {
                    const text = assistantMsg.content || '';
                    if (text) {
                      for (let i = 0; i < text.length; i += 4) {
                        counted(text.slice(i, i + 4));
                        await sleep(8);
                      }
                    } else {
                      await streamOnce({ key, model, messages: conversation, onToken: counted });
                    }

                    if (delivered > 0) {
                      setConnection({ status: 'online', message: '' });
                      return { source: 'groq', model, drew: drewAnything };
                    }
                    throw new GroqError('server', 'Groq returned an empty response.');
                  }

                  // Process tool calls
                  conversation.push(assistantMsg);
                  const actionsToBatch = [];
                  const toolResponses = [];

                  for (const call of toolCalls) {
                    const fnName = call.function?.name;
                    let parsedArgs = {};
                    try {
                      parsedArgs =
                        typeof call.function?.arguments === 'string'
                          ? JSON.parse(call.function.arguments)
                          : call.function?.arguments || {};
                    } catch (parseErr) {
                      toolResponses.push({
                        role: 'tool',
                        tool_call_id: call.id,
                        name: fnName,
                        content: JSON.stringify({ error: `Invalid arguments JSON: ${parseErr.message}` })
                      });
                      continue;
                    }

                    actionsToBatch.push({
                      tool_call_id: call.id,
                      type: fnName,
                      ...parsedArgs
                    });
                  }

                  if (actionsToBatch.length > 0) {
                    drewAnything = true;
                    const batchResult = await applyAiBatch(actionsToBatch);

                    for (let i = 0; i < actionsToBatch.length; i++) {
                      const act = actionsToBatch[i];
                      const resItem = batchResult.results?.[i] || { result: 'OK' };
                      toolResponses.push({
                        role: 'tool',
                        tool_call_id: act.tool_call_id,
                        name: act.type,
                        content: JSON.stringify(resItem.error ? { error: resItem.error } : resItem.result || { success: true })
                      });
                    }
                  }

                  conversation.push(...toolResponses);
                }

                if (delivered > 0) {
                  setConnection({ status: 'online', message: '' });
                  return { source: 'groq', model, drew: drewAnything };
                }
              } catch (e) {
                offlineReason = e.message;
                if (delivered > 0) return { source: 'groq', model, partial: true };
                if (e.kind === 'invalid-key') {
                  setConnection({ status: 'invalid-key', message: e.message });
                  break outer;
                }
                if (e.kind === 'model') continue outer;
                if (e.kind === 'rate-limit' && attempt === 2) continue outer;
                if (e.kind === 'network' && attempt === 2) break outer;
                await sleep(e.retryAfter ? Math.min(e.retryAfter, 8) * 1000 : 700 * 2 ** attempt);
              }
            }
          }
          setConnection((c) => (c.status === 'invalid-key' ? c : { status: 'offline', message: offlineReason }));
        }

        // Offline fallback mode: Never pretend to draw
        const isDrawingQuery = /draw|plot|triangle|circle|polygon|ruler|perpendicular|angle|canvas|point|pentagon|hexagon/i.test(userText);
        if (isDrawingQuery) {
          onToken('⚠️ Drawing needs the live AI. Please connect a valid Groq API key to enable interactive drawing on the canvas.\n\n');
        } else {
          onToken(`⚠️ Live AI unavailable (${offlineReason}) — using the built-in offline solver.\n\n`);
        }

        const words = getOfflineTutorResponse(userText).split(/(\s+)/);
        for (let i = 0; i < words.length; i += 3) {
          onToken(words.slice(i, i + 3).join(''));
          await sleep(25);
        }
        return { source: 'offline', reason: offlineReason };
      } finally {
        setIsLoading(false);
      }
    },
    [aiModel, models, applyAiBatch]
  );

  return { sendMessage, isLoading, connection, models, recheck: checkConnection };
}
