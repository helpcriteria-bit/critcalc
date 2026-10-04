import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getOfflineTutorResponse, processTutorQuery } from '../utils/mathTutorEngine';
import { CANVAS_TOOLS } from '../canvas/canvasTools';
import { getCanvasState } from '../canvas/canvasActions';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const PLACEHOLDER_KEYS = [
  '',
  'apikeyhere',
  'your_key_here',
  'your_groq_api_key_here',
  'your_gemini_api_key_here'
];

export const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest';
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
export const DEFAULT_MODEL = DEFAULT_GEMINI_MODEL;

export const GEMINI_FALLBACK_MODELS = [
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite (Quota Saver & Fast)' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (High Reasoning)' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' }
];

export const GROQ_FALLBACK_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Math & Tools)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fastest)' }
];

export const FALLBACK_MODELS = [...GEMINI_FALLBACK_MODELS, ...GROQ_FALLBACK_MODELS];

const NOT_CHAT = /whisper|tts|orpheus|guard|safeguard|embed|playai|imagen|aqa/i;

export function isValidKey(key) {
  const k = (key || '').trim();
  return !PLACEHOLDER_KEYS.includes(k) && k.length >= 20;
}

export function detectProvider(key) {
  const k = (key || '').trim();
  if (k.startsWith('AIzaSy') || k.startsWith('AIza') || k.startsWith('AQ.')) return 'gemini';
  if (k.startsWith('gsk_')) return 'groq';
  return null;
}

export function isCanvasDrawingCommand(text) {
  const t = (text || '').trim();
  if (/^(?:how|what|why|explain|teach|describe)\b/i.test(t)) return false;
  return (
    /^(?:please\s+)?(?:draw|create|cretae|make|construct|plot|show|illustrate|add|insert|clear|reset|erase|fit|zoom|center)\b/i.test(t) ||
    /\b(?:draw|create|cretae|make|construct|plot|show|illustrate|add|insert)\s+(?:me\s+)?(?:a|an|the|this|that|it)?\s*(?:triangle|circle|incircle|in-circle|circumcircle|circum-circle|altitude|height|median|bisector|ruler|rectangle|square|polygon|pentagon|hexagon|line|segment|shape|it)\b/i.test(t) ||
    /\b(?:incircle|in-circle|inscribed\s+circle|circumcircle|circum-circle|circumscribed\s+circle|altitude|median|bisector|clear canvas|reset canvas)\b/i.test(t)
  );
}

const BASE_SYSTEM_PROMPT =
  'You are a sharp, friendly, and expert maths and geometry tutor for secondary-school students. ' +
  'You have full interactive access to a 2D geometry canvas via provided tools.\n\n' +
  'CANVAS SYSTEM & DRAWING RULES:\n' +
  '1. Coordinate system: Origin (0, 0) is at the center of the canvas. Coordinates are in centimeters (cm). ' +
  'Positive X goes right, positive Y goes UP.\n' +
  '2. DRAW INSTEAD OF DESCRIBING: When the student asks to draw, construct, show, or illustrate any geometric figure ' +
  '(e.g., "draw a 3-4-5 triangle", "draw an incircle in it", "draw a regular pentagon", "draw circle radius 4"), ' +
  'you MUST call the appropriate drawing tools to draw the figure on the canvas rather than merely describing it in text. ' +
  'Use add_triangle for triangles, add_circle for circles & incircles, add_regular_polygon for regular polygons, ' +
  'add_rectangle for rectangles, add_line for altitudes/medians, and add_ruler for measurements. ' +
  'After drawing a triangle or circle, state all key dimensions, side lengths, and interior angles from the tool results. ' +
  'Also draw when a visual figure clearly helps explain a concept. Only draw when asked or when a figure clearly helps.\n' +
  '3. POINT LABELS: Always label points (A, B, C, I for incenter, O for circumcenter, D for altitude foot, M for midpoint) ' +
  'so the student can follow along.\n' +
  '4. STEP-BY-STEP EXPLANATION: After executing canvas actions, provide a clear, numbered step-by-step mathematical explanation ' +
  'in your text response with exact formulas. Wrap any math expression in backticks like `r = Δ / s` or `AB = 5.00 cm`.\n' +
  '5. REUSING EXISTING OBJECTS: When asked to extend or add to existing figures (e.g. "draw a incircle in it" or "draw altitude from C to AB"), ' +
  'inspect the CURRENT CANVAS STATE below and reuse existing points and labels instead of creating duplicates.\n' +
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

class AIError extends Error {
  constructor(kind, message, { provider, status, retryAfter } = {}) {
    super(message);
    this.kind = kind; // invalid-key | model | rate-limit | server | network | timeout
    this.provider = provider;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function toAIError(res, provider) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.error?.message || '';
  } catch (_) {}

  const retryAfter = Number(res.headers.get('retry-after')) || 0;
  const s = res.status;
  const pName = provider === 'gemini' ? 'Gemini' : 'Groq';

  if (s === 401 || s === 403 || (s === 400 && /API_KEY|API key/i.test(detail)))
    return new AIError('invalid-key', `${pName} API key rejected. Check that it is correct and active.`, { provider, status: s });
  if (s === 429)
    return new AIError('rate-limit', `${pName} rate limit reached. Retrying shortly.`, { provider, status: s, retryAfter });
  if (s === 404 || (s === 400 && /model|decommission/i.test(detail)))
    return new AIError('model', detail || `This model is not available on ${pName}.`, { provider, status: s });
  if (s >= 500) return new AIError('server', `${pName} server error (${s}).`, { provider, status: s });
  return new AIError('server', detail || `${pName} returned ${s}.`, { provider, status: s });
}

async function timedFetch(url, options, ms = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new AIError('timeout', 'Request took too long to respond.');
    throw new AIError('network', 'Cannot connect to AI service. Check your internet connection.');
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getApiKeyHeaders(provider, key) {
  return provider === 'gemini'
    ? { 'x-goog-api-key': key }
    : { Authorization: `Bearer ${key}` };
}

// Non-streaming completion call with tool calling
async function callChatOnce({ provider, key, model, messages, tools, tool_choice }) {
  const base = provider === 'gemini' ? GEMINI_API_BASE : GROQ_API_BASE;
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

  const url = `${base}/chat/completions`;

  const res = await timedFetch(
    url,
    {
      method: 'POST',
      headers: { ...getApiKeyHeaders(provider, key), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    25000
  );
  if (!res.ok) throw await toAIError(res, provider);
  return await res.json();
}

// Streaming completion call
async function streamOnce({ provider, key, model, messages, onToken }) {
  const base = provider === 'gemini' ? GEMINI_API_BASE : GROQ_API_BASE;
  const url = `${base}/chat/completions`;

  const res = await timedFetch(
    url,
    {
      method: 'POST',
      headers: { ...getApiKeyHeaders(provider, key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.6, stream: true })
    },
    20000
  );
  if (!res.ok) throw await toAIError(res, provider);

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
        } catch (_) {}
      }
    }
  }
  return count;
}

export function useAI() {
  const {
    aiProvider,
    setAiProvider,
    geminiKey,
    groqKey,
    aiModel,
    setAiModel,
    geoObjects,
    gridSettings,
    allowAiDraw,
    previewAiBatch,
    applyAiBatch
  } = useApp();

  const activeProvider = aiProvider || 'gemini';
  const activeKey = (activeProvider === 'gemini' ? geminiKey : groqKey) || '';

  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState(() => (activeProvider === 'gemini' ? GEMINI_FALLBACK_MODELS : GROQ_FALLBACK_MODELS));
  const [connection, setConnection] = useState({
    status: isValidKey(activeKey) ? 'checking' : 'no-key',
    message: '',
    provider: activeProvider
  });

  const providerRef = useRef(activeProvider);
  providerRef.current = activeProvider;

  const keyRef = useRef(activeKey);
  keyRef.current = activeKey;

  const geminiKeyRef = useRef(geminiKey);
  geminiKeyRef.current = geminiKey;

  const groqKeyRef = useRef(groqKey);
  groqKeyRef.current = groqKey;

  const geoObjectsRef = useRef(geoObjects);
  geoObjectsRef.current = geoObjects;

  const gridSettingsRef = useRef(gridSettings);
  gridSettingsRef.current = gridSettings;

  const allowAiDrawRef = useRef(allowAiDraw);
  allowAiDrawRef.current = allowAiDraw;

  // Health check: validates key and checks models
  const checkConnection = useCallback(async () => {
    const prov = providerRef.current;
    const key = (keyRef.current || '').trim();

    if (!isValidKey(key)) {
      setConnection({
        status: 'no-key',
        message: `No ${prov === 'gemini' ? 'Gemini' : 'Groq'} API key configured.`,
        provider: prov
      });
      return false;
    }

    try {
      if (prov === 'gemini') {
        const res = await timedFetch(
          'https://generativelanguage.googleapis.com/v1beta/models',
          { headers: getApiKeyHeaders(prov, key) },
          8000
        );
        if (!res.ok) throw await toAIError(res, 'gemini');
        const data = await res.json();
        const rawModels = data.models || [];
        const deprecated = /gemini-(?:1\.|2\.)/i;
        const validModels = rawModels
          .filter((m) => m.name && m.name.includes('gemini') && !NOT_CHAT.test(m.name) && !deprecated.test(m.name))
          .map((m) => {
            const id = m.name.replace(/^models\//, '');
            return { id, name: m.displayName || id };
          });

        if (validModels.length > 0) {
          setModels(validModels);
          setAiModel((current) =>
            validModels.some((m) => m.id === current)
              ? current
              : validModels.some((m) => m.id === DEFAULT_GEMINI_MODEL)
              ? DEFAULT_GEMINI_MODEL
              : validModels[0].id
          );
        } else {
          setModels(GEMINI_FALLBACK_MODELS);
        }
      } else {
        const res = await timedFetch(
          `${GROQ_API_BASE}/models`,
          { headers: getApiKeyHeaders(prov, key) },
          8000
        );
        if (!res.ok) throw await toAIError(res, 'groq');
        const data = await res.json();
        const ids = (data.data || []).map((m) => m.id).filter((id) => !NOT_CHAT.test(id)).sort();
        if (ids.length) {
          setModels(ids.map((id) => ({ id, name: id })));
          setAiModel((current) =>
            ids.includes(current)
              ? current
              : ids.includes(DEFAULT_GROQ_MODEL)
              ? DEFAULT_GROQ_MODEL
              : ids[0]
          );
        } else {
          setModels(GROQ_FALLBACK_MODELS);
        }
      }

      setConnection({ status: 'online', message: '', provider: prov });
      return true;
    } catch (e) {
      setConnection({
        status: e.kind === 'invalid-key' ? 'invalid-key' : 'offline',
        message: e.message,
        provider: prov
      });
      return false;
    }
  }, [setAiModel]);

  useEffect(() => {
    setModels(activeProvider === 'gemini' ? GEMINI_FALLBACK_MODELS : GROQ_FALLBACK_MODELS);
    setConnection((c) => ({
      ...c,
      status: isValidKey(activeKey) ? 'checking' : 'no-key',
      provider: activeProvider
    }));
    checkConnection();
    const onOnline = () => checkConnection();
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
    };
  }, [activeProvider, activeKey, checkConnection]);

  const sendMessage = useCallback(
    async (userText, history = [], onToken) => {
      setIsLoading(true);
      let offlineReason = 'No API key configured.';

      try {
        const prov = providerRef.current;
        const key = (keyRef.current || '').trim();
        const canUseLiveAI = isValidKey(key);
        const isCanvasCommand = isCanvasDrawingCommand(userText);

        // 1. Drawing requested but canvas access turned off
        if (isCanvasCommand && !allowAiDrawRef.current) {
          onToken('Canvas access is turned off. Turn on Canvas access in the tutor controls to let me draw.\n\n');
          const words = getOfflineTutorResponse(userText).split(/(\s+)/);
          for (let i = 0; i < words.length; i += 3) {
            onToken(words.slice(i, i + 3).join(''));
            await sleep(20);
          }
          return { source: 'offline-access-off' };
        }

        // 2. Direct local canvas execution when no live key is configured
        if (isCanvasCommand && allowAiDrawRef.current && !canUseLiveAI) {
          const localResult = processTutorQuery({
            prompt: userText,
            objects: geoObjectsRef.current,
            gridSettings: gridSettingsRef.current
          });
          if (localResult.drew) {
            // Live animated drawing with motion effect, synchronized alongside explanation text
            applyAiBatch(localResult.actions, { animate: true });
            const responseText = localResult.responseText;
            for (let i = 0; i < responseText.length; i += 4) {
              onToken(responseText.slice(i, i + 4));
              await sleep(10);
            }
            return { source: 'local-canvas', drew: true };
          }
        }

        // 3. Live AI Execution (Gemini or Groq)
        if (canUseLiveAI) {
          const sysPrompt = buildSystemPrompt(geoObjectsRef.current, gridSettingsRef.current);
          const messages = [
            { role: 'system', content: sysPrompt },
            ...history
              .filter((m) => !m.isError && !m.isOffline)
              .slice(-20)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText }
          ];

          const providerModels = models.map((model) => model.id);
          const defaultModel = prov === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_GROQ_MODEL;
          const selectedModel = providerModels.includes(aiModel) ? aiModel
            : providerModels.includes(defaultModel) ? defaultModel
            : providerModels[0] || defaultModel;
          const uniqueChain = [selectedModel, ...providerModels.filter((id) => id !== selectedModel)].slice(0, 2);
          let delivered = 0;
          const counted = (t) => {
            delivered += 1;
            onToken(t);
          };

          outer: for (const model of uniqueChain) {
            for (let attempt = 0; attempt < 1; attempt++) {
              try {
                let conversation = [...messages];
                let drewAnything = false;
                let pendingVisualBatch = [];
                let hasTriggeredLiveDraw = false;

                const triggerVisualDraw = () => {
                  if (pendingVisualBatch.length > 0 && !hasTriggeredLiveDraw) {
                    hasTriggeredLiveDraw = true;
                    const toDraw = pendingVisualBatch;
                    // Trigger live progressive drawing with hand-drawn motion effect
                    applyAiBatch(toDraw, { animate: true });
                  }
                };

                // Limit tool round-trips so an unproductive model cannot hold the tutor indefinitely.
                for (let iter = 0; iter < 4; iter++) {
                  // Selective tool passing: only include heavy tool schemas when drawing is needed!
                  const useTools = allowAiDrawRef.current && isCanvasCommand;
                  if (!useTools) {
                    const tokenCount = await streamOnce({
                      provider: prov,
                      key,
                      model,
                      messages: conversation,
                      onToken: counted
                    });
                    if (!tokenCount) throw new AIError('server', `${prov} returned empty output.`);
                    setConnection({ status: 'online', message: '', provider: prov });
                    return { source: prov, model, drew: false };
                  }

                  const chatResp = await callChatOnce({
                    provider: prov,
                    key,
                    model,
                    messages: conversation,
                    tools: useTools ? CANVAS_TOOLS : undefined,
                    tool_choice: useTools ? (iter === 0 ? 'required' : 'auto') : undefined
                  });

                  const choice = chatResp?.choices?.[0];
                  if (!choice) throw new AIError('server', `${prov} returned an empty response.`);

                  const assistantMsg = choice.message || {};
                  const toolCalls = assistantMsg.tool_calls || [];

                  // Deliver the final explanation without making a duplicate completion request.
                  if (toolCalls.length === 0) {
                    const text = assistantMsg.content || '';
                    if (text) {
                      triggerVisualDraw();
                      counted(text);
                    } else {
                      triggerVisualDraw();
                      if (drewAnything) counted('Done — I added the requested construction to the canvas.');
                    }

                    if (delivered > 0) {
                      setConnection({ status: 'online', message: '', provider: prov });
                      return { source: prov, model, drew: drewAnything };
                    }
                    throw new AIError('server', `${prov} returned empty output.`);
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
                        content: JSON.stringify({ error: `Invalid arguments: ${parseErr.message}` })
                      });
                      continue;
                    }

                    actionsToBatch.push({
                      ...parsedArgs,
                      tool_call_id: call.id,
                      type: fnName
                    });
                  }

                  if (actionsToBatch.length > 0) {
                    // Compute geometry results DRY so AI receives accurate mathematical results immediately
                    // WITHOUT popping shapes onto the canvas before the explanation starts
                    const combinedActions = [...pendingVisualBatch, ...actionsToBatch];
                    const preview = previewAiBatch ? previewAiBatch(combinedActions) : { results: [] };
                    const priorCount = pendingVisualBatch.length;
                    const currentResults = preview.results?.slice(priorCount) || [];
                    const validActions = actionsToBatch.filter((_, index) => !currentResults[index]?.error);
                    drewAnything = drewAnything || validActions.some(
                      (action) => typeof action.type === 'string' && action.type.startsWith('add_')
                    );

                    for (let i = 0; i < actionsToBatch.length; i++) {
                      const act = actionsToBatch[i];
                      const resItem = currentResults[i] || { result: 'OK' };
                      toolResponses.push({
                        role: 'tool',
                        tool_call_id: act.tool_call_id,
                        name: act.type,
                        content: JSON.stringify(resItem.error ? { error: resItem.error } : resItem.result || { success: true })
                      });
                    }

                    // Hold the visual actions to be animated alongside the explanation text
                    pendingVisualBatch = [...pendingVisualBatch, ...validActions];
                  }

                  conversation.push(...toolResponses);
                }

                if (delivered > 0) {
                  triggerVisualDraw();
                  setConnection({ status: 'online', message: '', provider: prov });
                  return { source: prov, model, drew: drewAnything };
                }
                if (pendingVisualBatch.length > 0) {
                  triggerVisualDraw();
                  counted('Done — I added the requested construction to the canvas.');
                  setConnection({ status: 'online', message: '', provider: prov });
                  return { source: prov, model, drew: drewAnything };
                }
              } catch (e) {
                offlineReason = e.message;
                if (delivered > 0) return { source: prov, model, partial: true };
                if (e.kind === 'invalid-key') {
                  setConnection({ status: 'invalid-key', message: e.message, provider: prov });
                  break outer;
                }
                if (e.kind === 'rate-limit') {
                  // If rate limit is reached and it's a standard drawing command, break to local geometric engine
                  if (isCanvasCommand && allowAiDrawRef.current) {
                    break outer;
                  }
                }
                if (e.kind === 'model') continue outer;
              }
            }
          }
          setConnection((c) => (c.status === 'invalid-key' ? c : { status: 'offline', message: offlineReason, provider: prov }));
        }

        // 4. Fallback execution: Check if local geometry command can construct it!
        if (isCanvasCommand && allowAiDrawRef.current) {
          const localResult = processTutorQuery({
            prompt: userText,
            objects: geoObjectsRef.current,
            gridSettings: gridSettingsRef.current
          });

          if (localResult.drew) {
            // Live progressive drawing with motion effect
            applyAiBatch(localResult.actions, { animate: true });
            const failures = localResult.actions?.filter((item) => item.error) || [];
            let responseText = failures.length
              ? `I couldn't complete the canvas action: ${failures.map((item) => item.error).join('; ')}`
              : localResult.responseText;

            if (canUseLiveAI) {
              responseText = `*(AI quota limit reached — constructing directly on your canvas with CritCalc's high-precision geometry engine)*\n\n` + responseText;
            }

            for (let i = 0; i < responseText.length; i += 4) {
              onToken(responseText.slice(i, i + 4));
              await sleep(10);
            }
            return { source: 'local-canvas-fallback', drew: failures.length === 0 };
          }
        }

        // 5. Offline Theory Solver fallback
        if (isCanvasCommand) {
          onToken(`⚠️ Live AI unavailable (${offlineReason}) — this drawing request needs a supported local canvas command or active AI connection.\n\n`);
        } else {
          onToken(`⚠️ Live AI unavailable (${offlineReason}) — using built-in offline educational solver.\n\n`);
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
    [aiModel, applyAiBatch, models, previewAiBatch]
  );

  return {
    sendMessage,
    isLoading,
    connection,
    models,
    recheck: checkConnection,
    provider: activeProvider,
    setProvider: setAiProvider
  };
}

// Re-export as useGroq for backwards compatibility
export const useGroq = useAI;
export default useAI;
