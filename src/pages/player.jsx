// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, Languages } from 'lucide-react';

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
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const lastVersionRef = useRef(-1);
  const hideTimerRef = useRef(null);

  // 计算自适应字号
  const calculateFontSize = () => {
    const {
      innerWidth,
      innerHeight
    } = window;
    const baseSize = Math.min(innerWidth, innerHeight);
    return Math.floor(baseSize / 20); // 根据屏幕尺寸动态计算
  };

  // 设置语言选择器自动隐藏
  const setupAutoHide = () => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowLanguageSelector(false);
    }, 5000);
  };

  // 点击屏幕显示语言选择器
  const handleScreenClick = () => {
    setShowLanguageSelector(true);
    setupAutoHide();
  };

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
    setConnectionStatus('connected');
    setSessionState(dummySessionState);
    lastVersionRef.current = dummySessionState.version;

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
  };
  useEffect(() => {
    const init = async () => {
      try {
        // 从路由参数获取sessionId
        const {
          sessionId
        } = $w.page.dataset.params;

        // 初始化字号
        setFontSize(calculateFontSize());

        // 监听屏幕尺寸变化
        const handleResize = () => {
          setFontSize(calculateFontSize());
        };
        window.addEventListener('resize', handleResize);

        // 加载剧本
        await loadScript({
          scriptId: "script1",
          scriptHash: "abc123",
          defaultLang: "zh",
          langs: ["zh", "en"]
        });

        // 订阅状态
        const cleanup = subscribeSessionState(sessionId);

        // 设置语言选择器自动隐藏
        setupAutoHide();
        return () => {
          window.removeEventListener('resize', handleResize);
          cleanup();
          clearTimeout(hideTimerRef.current);
        };
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 渲染当前字幕
  const renderCurrentCue = () => {
    if (!script || !sessionState) return null;
    const cue = script.cues[sessionState.cueIndex];
    if (!cue) return null;

    // 语言回退逻辑
    let text = cue.texts[currentLang] || cue.texts[script.meta.languages[0]] || Object.values(cue.texts)[0];
    const isFallback = !cue.texts[currentLang];
    return <div className="flex items-center justify-center h-full">
      <p className="text-center px-4" style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize * 1.2}px`,
        maxWidth: '80%',
        color: '#FFFFFF'
      }}>
        {text}
        {isFallback && <span className="text-xs text-gray-400 ml-2">(缺省)</span>}
      </p>
    </div>;
  };

  // 语言选择器
  const renderLanguageSelector = () => {
    if (!script || !showLanguageSelector) return null;
    return <div className="absolute bottom-4 left-0 right-0 flex justify-center">
      <div className="bg-black bg-opacity-70 rounded-full p-2">
        <select value={currentLang} onChange={e => {
          setCurrentLang(e.target.value);
          setupAutoHide();
        }} className="bg-transparent text-white border-none focus:ring-0">
          {script.meta.languages.map(lang => <option key={lang} value={lang} className="bg-black text-white">
              {lang.toUpperCase()}
            </option>)}
        </select>
      </div>
    </div>;
  };
  if (loading) {
    return <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-lg">正在加载剧本...</p>
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
  return <div className="flex flex-col h-screen bg-black text-white relative" onClick={handleScreenClick}>
    {renderCurrentCue()}
    {renderLanguageSelector()}
  </div>;
}