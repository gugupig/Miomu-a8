// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, WifiOff, Settings, Languages } from 'lucide-react';

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
  const lastVersionRef = useRef(-1);

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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      // 清理订阅
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
    return <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="max-w-4xl w-full p-6 rounded-lg bg-card shadow-lg" style={{
        borderLeft: `6px solid ${script.roles[cue.role]?.color || "#666"}`
      }}>
          <p className="text-xl font-medium mb-2">{cue.role}</p>
          <p className="text-2xl">
            {text}
            {isFallback && <span className="text-sm text-muted-foreground ml-2">(缺省)</span>}
          </p>
        </div>
      </div>;
  };

  // 语言选择器
  const renderLanguageSelector = () => {
    if (!script) return null;
    return <div className="absolute bottom-4 right-4 bg-background rounded-full p-2 shadow-lg">
        <select value={currentLang} onChange={e => setCurrentLang(e.target.value)} className="bg-transparent border-none focus:ring-0">
          {script.meta.languages.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
        </select>
      </div>;
  };

  // 状态指示器
  const renderStatusIndicator = () => {
    let statusText = "";
    let statusColor = "";
    switch (connectionStatus) {
      case 'connected':
        statusText = `已连接 v${sessionState?.version || 0}`;
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
    return <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">正在加载剧本...</p>
      </div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">
          {error.message === "HASH_MISMATCH" ? "剧本校验失败" : "连接错误"}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message === "HASH_MISMATCH" ? "剧本版本不匹配，请刷新重试" : "无法连接到服务器"}
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          重试
        </button>
      </div>;
  }
  return <div className="flex flex-col h-screen bg-background text-foreground">
      {renderStatusIndicator()}
      {renderCurrentCue()}
      {renderLanguageSelector()}
    </div>;
}