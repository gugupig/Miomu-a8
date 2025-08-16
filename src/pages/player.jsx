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

  // 调试用的dummy字幕数据
  const dummyScript = {
    _id: "script1",
    meta: {
      hash: "abc123",
      languages: ["zh", "en", "ja"]
    },
    cues: [{
      id: "cue1",
      texts: {
        zh: "欢迎来到我们的演出",
        en: "Welcome to our performance",
        ja: "私たちの公演へようこそ"
      }
    }, {
      id: "cue2",
      texts: {
        zh: "请关闭手机或调至静音",
        en: "Please turn off or mute your phones",
        ja: "携帯電話の電源を切るかサイレントモードにしてください"
      }
    }, {
      id: "cue3",
      texts: {
        zh: "演出即将开始",
        en: "The show is about to begin",
        ja: "ショーはまもなく始まります"
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

  // 计算自适应字号
  const calculateFontSize = () => {
    const {
      innerWidth,
      innerHeight
    } = window;
    const baseSize = Math.min(innerWidth, innerHeight);
    return Math.floor(baseSize / 20);
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

  // 加载剧本
  const loadScript = async scriptRef => {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 直接使用调试数据，跳过校验
      setScript(dummyScript);
      setCurrentLang(scriptRef.defaultLang || "zh");
      return dummyScript;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // 订阅实时状态
  const subscribeSessionState = sessionId => {
    // 直接使用调试状态
    setSessionState(dummySessionState);
    lastVersionRef.current = dummySessionState.version;

    // 模拟字幕轮播
    const interval = setInterval(() => {
      setSessionState(prev => {
        const newIndex = (prev.cueIndex + 1) % dummyScript.cues.length;
        return {
          ...prev,
          cueIndex: newIndex,
          version: prev.version + 1,
          updatedAt: new Date().toISOString()
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  };
  useEffect(() => {
    const init = async () => {
      try {
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
          langs: ["zh", "en", "ja"]
        });

        // 订阅状态
        const cleanup = subscribeSessionState("session1");

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
  return <div className="flex flex-col h-screen bg-black text-white relative" onClick={handleScreenClick}>
      {renderCurrentCue()}
      {renderLanguageSelector()}
    </div>;
}