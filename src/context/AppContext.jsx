import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { applyAction } from '../canvas/canvasActions';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const isPlaceholder = (k) => !k || k === 'your_key_here' || k === 'apikeyhere';
  const readKey = () => {
    const stored = (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('mathcanvas_groq_key') : '') || '';
    const env = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
    if (!isPlaceholder(stored.trim())) return stored.trim();
    if (!isPlaceholder(env)) return env;
    return '';
  };
  const [groqKey, setGroqKeyState] = useState(readKey);

  const [chatHistory, setChatHistory] = useState([]);
  const [geoObjects, setGeoObjects] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [calcMemory, setCalcMemory] = useState(0);

  // Cloud Canvas Document State
  const [currentCanvasId, setCurrentCanvasId] = useState(null);
  const [canvasName, setCanvasName] = useState('Untitled Geometry Canvas');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'failed'
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const activeCanvasElementRef = useRef(null);

  const registerCanvasElement = useCallback((canvasEl) => {
    activeCanvasElementRef.current = canvasEl;
  }, []);

  const loadCanvasDocument = useCallback((canvasDoc) => {
    if (!canvasDoc) return;
    setCurrentCanvasId(canvasDoc.id || null);
    setCanvasName(canvasDoc.name || 'Untitled Geometry Canvas');
    const data = canvasDoc.canvasData || {};
    setGeoObjects(Array.isArray(data.geoObjects) ? data.geoObjects : []);
    if (data.gridSettings) {
      setGridSettings(data.gridSettings);
    }
    if (data.transform) {
      setTransform(data.transform);
    }
    historyRef.current = [];
    redoRef.current = [];
    setSelectedIdState(null);
    setSelectedIdsState([]);
    setSaveStatus('saved');
    setLastSavedAt(canvasDoc.updatedAt || new Date().toISOString());
  }, []);

  const resetCanvasToNew = useCallback(() => {
    setCurrentCanvasId(null);
    setCanvasName('Untitled Geometry Canvas');
    setGeoObjects([]);
    historyRef.current = [];
    redoRef.current = [];
    setSelectedIdState(null);
    setSelectedIdsState([]);
    setSaveStatus('saved');
    setLastSavedAt(null);
  }, []);

  // Pan & Zoom transform lifted to shared context
  const [transform, setTransform] = useState({ offsetX: 0, offsetY: 0, scale: 1.2 });
  const [selectedId, setSelectedIdState] = useState(null);
  const [selectedIds, setSelectedIdsState] = useState([]);

  const setSelectedIds = useCallback((idsOrUpdater) => {
    setSelectedIdsState(prev => {
      const next = typeof idsOrUpdater === 'function' ? idsOrUpdater(prev) : idsOrUpdater;
      const arr = Array.isArray(next) ? next : (next ? [next] : []);
      setSelectedIdState(arr.length > 0 ? arr[0] : null);
      return arr;
    });
  }, []);

  const setSelectedId = useCallback((id) => {
    setSelectedIdState(id);
    setSelectedIdsState(id ? [id] : []);
  }, []);

  // Shared Undo & Redo History Stacks (Max 40 states)
  const historyRef = useRef([]);
  const redoRef = useRef([]);

  const geoObjectsRef = useRef(geoObjects);
  geoObjectsRef.current = geoObjects;

  const pushHistory = useCallback((snapshot) => {
    historyRef.current = [...historyRef.current.slice(-39), snapshot];
    redoRef.current = []; // Clear redo stack on new action
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length > 0) {
      const prev = historyRef.current.pop();
      redoRef.current.push([...geoObjectsRef.current]);
      setGeoObjects(prev);
      setSelectedIdState(null);
      setSelectedIdsState([]);
      return true;
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (redoRef.current.length > 0) {
      const next = redoRef.current.pop();
      historyRef.current.push([...geoObjectsRef.current]);
      setGeoObjects(next);
      setSelectedIdState(null);
      setSelectedIdsState([]);
      return true;
    }
    return false;
  }, []);

  const clearCanvas = useCallback((skipConfirm = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to clear the entire canvas?')) {
      pushHistory(geoObjectsRef.current);
      setGeoObjects([]);
      setSelectedIdState(null);
      setSelectedIdsState([]);
    }
  }, [pushHistory]);

  const selectObject = useCallback((id) => {
    setSelectedId(id);
  }, [setSelectedId]);

  const selectObjects = useCallback((ids) => {
    setSelectedIds(ids);
  }, [setSelectedIds]);

  // Student Grid & Measurement Settings
  const [gridSettings, setGridSettings] = useState(() => {
    const saved = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('critcalc_grid_settings') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      showGrid: true,
      gridStyle: 'subdivided', // 'lines', 'dots', 'subdivided', 'isometric'
      gridSize: 40,            // 40px in world space (1 cm = 40px)
      showAxes: true,          // X and Y coordinate axis lines with 0 origin
      snapToGrid: false,       // Snap points and vertices to grid intersections
      showRulers: true,        // Top & Left rulers
      unit: 'cm'               // 'cm', 'px', 'mm', 'in'
    };
  });

  const gridSettingsRef = useRef(gridSettings);
  gridSettingsRef.current = gridSettings;

  const updateGridSettings = useCallback((newSettings) => {
    setGridSettings((prev) => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('critcalc_grid_settings', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
  }, []);

  // AI Tutor Model Selection (Default to llama-3.3-70b-versatile for tool calling)
  const [aiModel, setAiModelState] = useState(() => {
    const saved = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('critcalc_ai_model') : null;
    return saved || 'llama-3.3-70b-versatile';
  });

  const setAiModel = (model) => {
    setAiModelState((prev) => {
      const next = typeof model === 'function' ? model(prev) : model;
      if (next !== prev && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('critcalc_ai_model', next);
      }
      return next;
    });
  };

  // Toggle "Allow AI to draw" (Default true, persisted in localStorage)
  const [allowAiDraw, setAllowAiDrawState] = useState(() => {
    const val = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('critcalc_allow_ai_draw') : null;
    return val === null ? true : val === 'true';
  });

  const setAllowAiDraw = (val) => {
    setAllowAiDrawState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('critcalc_allow_ai_draw', String(next));
      }
      return next;
    });
  };

  // Student Confirmation Bar state for destructive AI actions (clear_canvas, delete_object)
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const confirmPendingAction = useCallback(() => {
    if (!pendingConfirmation) return;
    if (pendingConfirmation.type === 'clear_canvas') {
      pushHistory(geoObjectsRef.current);
      setGeoObjects([]);
      setSelectedId(null);
    } else if (pendingConfirmation.type === 'delete_object' && pendingConfirmation.id) {
      pushHistory(geoObjectsRef.current);
      setGeoObjects((prev) => prev.filter((o) => o.id !== pendingConfirmation.id));
      if (selectedId === pendingConfirmation.id) setSelectedId(null);
    }
    setPendingConfirmation(null);
  }, [pendingConfirmation, pushHistory, selectedId]);

  const cancelPendingAction = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

  // Apply batch of AI actions with a SINGLE undo snapshot and staggered appearance
  const applyAiBatch = useCallback(
    async (actions = []) => {
      if (!actions || actions.length === 0) return { results: [] };

      // Snapshot before AI batch runs, so one Undo removes everything drawn
      const initialObjects = [...geoObjectsRef.current];
      pushHistory(initialObjects);

      let currentObjects = [...initialObjects];
      const results = [];
      const errors = [];

      for (const action of actions) {
        const { objects: nextObjects, result, error, isConfirmationNeeded } = applyAction(
          currentObjects,
          { ...action, source: 'ai' },
          {
            gridSettings: gridSettingsRef.current,
            setGridSettings: updateGridSettings,
            selectObject,
            setTransform,
            undo,
            requestConfirmation: (conf) => setPendingConfirmation(conf)
          }
        );

        if (error) {
          errors.push(error);
          results.push({ action: action.type || action.name, error });
        } else {
          currentObjects = nextObjects;
          results.push({
            action: action.type || action.name,
            result: result || { success: true },
            isConfirmationNeeded
          });
        }
      }

      // Check student preference for reduced motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const newlyAdded = currentObjects.filter(
        (o) => !initialObjects.some((io) => io.id === o.id)
      );

      if (prefersReducedMotion || newlyAdded.length <= 1) {
        setGeoObjects(currentObjects);
      } else {
        // Stagger appearance ~150ms apart
        let displayed = [...initialObjects];
        for (let i = 0; i < newlyAdded.length; i++) {
          displayed = [...displayed, newlyAdded[i]];
          setGeoObjects(displayed);
          if (i < newlyAdded.length - 1) {
            await new Promise((r) => setTimeout(r, 150));
          }
        }
        setGeoObjects(currentObjects);
      }

      return { results, errors, finalObjects: currentObjects };
    },
    [pushHistory, undo, updateGridSettings, selectObject]
  );

  const undoAiDrawing = useCallback(() => {
    undo();
  }, [undo]);

  const setGroqKey = (key) => {
    const k = (key || '').trim();
    if (typeof window !== 'undefined' && window.localStorage) {
      if (k) {
        localStorage.setItem('mathcanvas_groq_key', k);
      } else {
        localStorage.removeItem('mathcanvas_groq_key');
      }
    }
    if (k) {
      setGroqKeyState(k);
    } else {
      setGroqKeyState(readKey());
    }
  };

  return (
    <AppContext.Provider
      value={{
        groqKey,
        setGroqKey,
        aiModel,
        setAiModel,
        gridSettings,
        setGridSettings: updateGridSettings,
        chatHistory,
        setChatHistory,
        geoObjects,
        setGeoObjects,
        activeTool,
        setActiveTool,
        calcMemory,
        setCalcMemory,
        // Lifted canvas state
        transform,
        setTransform,
        selectedId,
        setSelectedId,
        selectedIds,
        setSelectedIds,
        selectObject,
        selectObjects,
        historyRef,
        pushHistory,
        undo,
        redo,
        clearCanvas,
        // Cloud Canvas Document state
        currentCanvasId,
        setCurrentCanvasId,
        canvasName,
        setCanvasName,
        saveStatus,
        setSaveStatus,
        lastSavedAt,
        setLastSavedAt,
        activeCanvasElementRef,
        registerCanvasElement,
        loadCanvasDocument,
        resetCanvasToNew,
        // AI Drawing controls
        allowAiDraw,
        setAllowAiDraw,
        applyAiBatch,
        undoAiDrawing,
        pendingConfirmation,
        confirmPendingAction,
        cancelPendingAction
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
