// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, WifiOff, Languages } from 'lucide-react';

// Dummy数据
const dummyScript = {
  _id: "script1",
  meta: {
    hash: "abc123",
    languages: ["zh", "en"]
  },
  roles: {
    "role1": {
      color: "#FF6B6B"
    },
    "role2": {
      color: "#4ECDC4"
    }
  },
  cues: [{
    id: "cue1",
    role: "role1",
    texts: {
      zh: "第一行字幕",
      en: "First subtitle"
    }
  }, {
    id: "cue2",
    role: "role2",
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
  const screenRef = useRef(null);

  // 计算动态字号
  const calculateFontSize = () => {
    if (!screenRef.current) return '2rem';
    const width = screenRef.current.clientWidth;
    return `${Math.min(width / 20, 48)}px`;
  };

  // 加载剧本
  const loadScript = async scriptRef => {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 校验hash
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
    let retryCount = 0;
    const maxRetries = 3;
    const connect = () => {
      setConnectionStatus('connecting');

      // 模拟连接
      setTimeout(() => {
        setConnectionStatus('connected');
        setSessionState(dummySessionState);

        // 模拟后续更新
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
    connect();

    // 模拟断线重连
    const disconnectTimer = setTimeout(() => {
      setConnectionStatus('disconnected');
      toast({
        title: "连接中断",
        description: "正在尝试重新连接...",
        variant: "destructive"
      });
      const retry = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          connect();
        } else {
          setError(new Error("CONNECTION_LOST"));
        }
      };
      setTimeout(retry, 2000);
    }, 10000);
    return () => clearTimeout(disconnectTimer);
  };

  // 设置语言选择器隐藏定时器
  const setupHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setShowLanguageSelector(true);
    hideTimerRef.current = setTimeout(() => {
      setShowLanguageSelector(false);
    }, 5000);
  };

  // 处理屏幕点击
  const handleScreenClick = () => {
    setupHideTimer();
  };
  useEffect(() => {
    const init = async () => {
      try {
        // 从路由参数获取sessionId
        const {
          sessionId
        } = $w.page.dataset.params;

        // 加载剧本
        await loadScript({
          scriptId: "script1",
          scriptHash: "abc123",
          defaultLang: "zh",
          langs: ["zh", "en"]
        });

        // 订阅状态
        subscribeSessionState(sessionId);

        // 设置初始隐藏定时器
        setupHideTimer();
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      // 清理订阅和定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // 渲染当前字幕
  const renderCurrentCue = () => {
    if (!script || !sessionState) return null;
    const cue = script.cues[sessionState.cueIndex];
    if (!cue) return null;

    // 语言回退逻辑
    let text = cue.texts[currentLang] || cue.texts[script.meta.languages[0]] || Object.values(cue.texts)[0];
    const isFallback = !cue.texts[currentLang];
    return <div className="flex items-center justify-center h-full w-full">
        <p className="text-center" style={{
        color: 'white',
        fontSize: calculateFontSize(),
        lineHeight: '1.5',
        padding: '0 10%',
        textShadow: '0 0 8px rgba(0,0,0,0.8)'
      }}>
          {text}
          {isFallback && <span className="text-sm opacity-70">(缺省)</span>}
        </p>
      </div>;
  };

  // 语言选择器
  const renderLanguageSelector = () => {
    if (!script || !showLanguageSelector) return null;
    return <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-black bg-opacity-70 rounded-full px-4 py-2">
          <select value={currentLang} onChange={e => {
          setCurrentLang(e.target.value);
          setupHideTimer();
        }} className="bg-transparent text-white border-none focus:ring-0">
            {script.meta.languages.map(lang => <option key={lang} value={lang} className="bg-black text-white">
                {lang.toUpperCase()}
              </option>)}
          </select>
        </div>
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
        <p className="text-white text-lg font-semibold mb-2">
          {error.message === "HASH_MISMATCH" ? "剧本校验失败" : "连接错误"}
        </p>
        <p className="text-gray-400 text-sm mb-6">
          {error.message === "HASH_MISMATCH" ? "剧本版本不匹配，请刷新重试" : "无法连接到服务器"}
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-black rounded-md">
          重试
        </button>
      </div>;
  }
  return <div ref={screenRef} className="fixed inset-0 bg-black flex flex-col overflow-hidden" onClick={handleScreenClick}>
      {renderCurrentCue()}
      {renderLanguageSelector()}
    </div>;
}