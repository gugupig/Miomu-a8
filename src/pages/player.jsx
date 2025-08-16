// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, WifiOff } from 'lucide-react';

export default function Player(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [script, setScript] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [currentLang, setCurrentLang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const lastVersionRef = useRef(-1);
  const hideTimerRef = useRef(null);

  // Dummy数据
  const dummyScript = {
    _id: "script1",
    meta: {
      hash: "abc123",
      languages: ["zh", "en"]
    },
    cues: [{
      id: "cue1",
      texts: {
        zh: "第一行字幕",
        en: "First subtitle"
      }
    }, {
      id: "cue2",
      texts: {
        zh: "第二行字幕",
        en: "Second subtitle"
      }
    }]
  };
  const dummySessionState = {
    sessionId: "session1",
    cueIndex: 0,
    lang: "zh",
    version: 1,
    updatedAt: new Date().toISOString()
  };

  // 加载剧本
  const loadScript = async scriptRef => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (scriptRef.scriptHash !== dummyScript.meta.hash) {
        throw new Error("HASH_MISMATCH");
      }
      setScript(dummyScript);
      setCurrentLang(scriptRef.defaultLang);
      return dummyScript;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // 订阅实时状态
  const subscribeSessionState = sessionId => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setSessionState(dummySessionState);
      const interval = setInterval(() => {
        const newVersion = dummySessionState.version + 1;
        if (newVersion > lastVersionRef.current) {
          lastVersionRef.current = newVersion;
          setSessionState({
            ...dummySessionState,
            version: newVersion,
            cueIndex: (dummySessionState.cueIndex + 1) % dummyScript.cues.length,
            updatedAt: new Date().toISOString()
          });
        }
      }, 3000);
      return () => clearInterval(interval);
    }, 1000);
  };
  useEffect(() => {
    const init = async () => {
      try {
        const {
          sessionId
        } = $w.page.dataset.params;
        await loadScript({
          scriptId: "script1",
          scriptHash: "abc123",
          defaultLang: "zh",
          langs: ["zh", "en"]
        });
        subscribeSessionState(sessionId);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 语言选择器自动隐藏
  useEffect(() => {
    if (showLanguageSelector) {
      hideTimerRef.current = setTimeout(() => {
        setShowLanguageSelector(false);
      }, 5000);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showLanguageSelector]);

  // 渲染当前字幕
  const renderCurrentCue = () => {
    if (!script || !sessionState) return null;
    const cue = script.cues[sessionState.cueIndex];
    if (!cue) return null;
    let text = cue.texts[currentLang] || cue.texts[script.meta.languages[0]] || Object.values(cue.texts)[0];
    const isFallback = !cue.texts[currentLang];
    return <div className="flex items-center justify-center h-full w-full">
        <p className={`text-white text-center text-[4vw] px-4 ${isFallback ? 'italic' : ''}`}>
          {text}
          {isFallback && <span className="text-sm opacity-70 ml-2">(缺省)</span>}
        </p>
      </div>;
  };

  // 语言选择器
  const renderLanguageSelector = () => {
    if (!script || !showLanguageSelector) return null;
    return <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 rounded-lg p-2">
        <select value={currentLang} onChange={e => {
        setCurrentLang(e.target.value);
        setShowLanguageSelector(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowLanguageSelector(false), 5000);
      }} className="bg-transparent text-white border border-gray-600 rounded px-2 py-1">
          {script.meta.languages.map(lang => <option key={lang} value={lang} className="bg-black text-white">
              {lang.toUpperCase()}
            </option>)}
        </select>
      </div>;
  };

  // 状态指示器
  const renderStatusIndicator = () => {
    let statusText = "";
    let statusColor = "";
    switch (connectionStatus) {
      case 'connected':
        statusText = `v${sessionState?.version || 0}`;
        statusColor = "text-green-500";
        break;
      case 'connecting':
        statusText = "连接中...";
        statusColor = "text-yellow-500";
        break;
      case 'disconnected':
        statusText = "连接中断";
        statusColor = "text-red-500";
        break;
      default:
        statusText = "未知状态";
        statusColor = "text-gray-500";
    }
    return <div className={`absolute top-4 right-4 text-sm ${statusColor}`}>
        {statusText}
      </div>;
  };
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-semibold text-white mb-2">
          {error.message === "HASH_MISMATCH" ? "剧本校验失败" : "连接错误"}
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-black rounded-md">
          重试
        </button>
      </div>;
  }
  return <div className="h-screen w-full bg-black text-white relative" onClick={() => {
    setShowLanguageSelector(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowLanguageSelector(false), 5000);
  }}>
      {renderStatusIndicator()}
      {renderCurrentCue()}
      {renderLanguageSelector()}
    </div>;
}