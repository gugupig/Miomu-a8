// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, Languages, ChevronLeft } from 'lucide-react';

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
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [orientation, setOrientation] = useState('landscape');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastVersionRef = useRef(-1);
  const hideTimerRef = useRef(null);
  const playerRef = useRef(null);

  // 从路由参数中获取sessionId和scriptRef
  const {
    sessionId,
    scriptRef
  } = $w.page.dataset.params;
  const parsedScriptRef = scriptRef ? JSON.parse(scriptRef) : null;

  // 进入全屏模式
  const enterFullscreen = () => {
    if (!playerRef.current) return;
    const elem = playerRef.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        toast({
          title: "全屏模式错误",
          description: err.message,
          variant: "destructive"
        });
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  // 退出全屏模式
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // 检测全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 自动进入全屏
  useEffect(() => {
    if (playerRef.current) {
      enterFullscreen();
    }
  }, [playerRef.current]);

  // 调试用的dummy字幕数据
  const dummyScript = {
    _id: parsedScriptRef?.scriptId || "script1",
    meta: {
      hash: parsedScriptRef?.scriptHash || "abc123",
      languages: parsedScriptRef?.langs || ["zh", "en", "ja"]
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
    }]
  };

  // 计算自适应字号
  const calculateFontSize = () => {
    const {
      innerWidth,
      innerHeight
    } = window;
    const baseSize = orientation === 'portrait' ? Math.min(innerWidth, innerHeight) : Math.max(innerWidth, innerHeight);
    return Math.floor(baseSize / (orientation === 'portrait' ? 20 : 15));
  };

  // 检测屏幕方向变化
  const handleOrientationChange = () => {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    setOrientation(newOrientation);
    setFontSize(calculateFontSize());
  };

  // 设置控制栏自动隐藏
  const setupAutoHide = () => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  // 点击屏幕显示控制栏
  const handleScreenClick = () => {
    setShowControls(true);
    setupAutoHide();
  };

  // 返回上一页
  const handleBack = () => {
    $w.utils.navigateBack();
  };

  // 加载剧本
  const loadScript = async scriptRef => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
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
    setSessionState({
      sessionId,
      cueIndex: 0,
      lang: parsedScriptRef?.defaultLang || "zh",
      version: 1,
      updatedAt: new Date().toISOString()
    });
    lastVersionRef.current = 1;
    const interval = setInterval(() => {
      setSessionState(prev => ({
        ...prev,
        cueIndex: (prev.cueIndex + 1) % dummyScript.cues.length,
        version: prev.version + 1,
        updatedAt: new Date().toISOString()
      }));
    }, 3000);
    return () => clearInterval(interval);
  };
  useEffect(() => {
    const init = async () => {
      try {
        // 初始方向检测
        handleOrientationChange();
        window.addEventListener('resize', handleOrientationChange);
        await loadScript(parsedScriptRef);
        const cleanup = subscribeSessionState(sessionId);
        setupAutoHide();
        return () => {
          window.removeEventListener('resize', handleOrientationChange);
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
    let text = cue.texts[currentLang] || cue.texts[script.meta.languages[0]] || Object.values(cue.texts)[0];
    const isFallback = !cue.texts[currentLang];
    return <div className="flex items-center justify-center h-full">
      <p className="text-center px-4" style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize * 1.2}px`,
        maxWidth: orientation === 'portrait' ? '80%' : '90%',
        color: '#FFFFFF',
        textShadow: '0 0 8px rgba(0,0,0,0.8)'
      }}>
        {text}
        {isFallback && <span className="text-xs text-gray-400 ml-2">(缺省)</span>}
      </p>
    </div>;
  };

  // 渲染控制栏
  const renderControls = () => {
    if (!showControls) return null;
    return <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
      {/* 顶部控制栏 */}
      <div className="flex justify-between items-center pointer-events-auto">
        <button onClick={handleBack} className="p-2 rounded-full bg-black bg-opacity-50 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 底部控制栏 */}
      <div className="flex justify-center pointer-events-auto">
        <div className="bg-black bg-opacity-70 rounded-full p-2">
          <select value={currentLang} onChange={e => {
            setCurrentLang(e.target.value);
            setupAutoHide();
          }} className="bg-transparent text-white border-none focus:ring-0">
            {script?.meta.languages.map(lang => <option key={lang} value={lang} className="bg-black text-white">
                {lang.toUpperCase()}
              </option>)}
          </select>
        </div>
      </div>
    </div>;
  };
  if (loading) {
    return <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-lg">正在加载剧本...</p>
    </div>;
  }
  return <div ref={playerRef} className="flex flex-col h-screen bg-black text-white relative" onClick={handleScreenClick} style={{
    position: isFullscreen ? 'fixed' : 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }}>
      {renderCurrentCue()}
      {renderControls()}
    </div>;
}