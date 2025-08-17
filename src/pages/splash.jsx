// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, WifiOff } from 'lucide-react';

export default function Splash(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState('none'); // 'none'|'network'|'service'
  const [startTime] = useState(Date.now());
  const mountedRef = useRef(true);
  const navigationTimerRef = useRef(null);
  const preloadDataRef = useRef(null);

  // 错误状态优先级
  const ERROR_PRIORITY = {
    network: 1,
    service: 2
  };

  // Dummy 数据用于 debug 和展示
  const dummyConfig = {
    serviceAvailable: true,
    announcement: "欢迎使用缪幕小程序",
    theme: "light"
  };

  // 预加载shows页面数据
  const preloadShowsData = async () => {
    try {
      // 模拟预加载数据
      await new Promise(resolve => setTimeout(resolve, 500));
      preloadDataRef.current = {
        shows: [{
          id: '1',
          title: '剧目1',
          poster: 'https://via.placeholder.com/300x450/667eea/ffffff?text=Show1'
        }, {
          id: '2',
          title: '剧目2',
          poster: 'https://via.placeholder.com/300x450/667eea/ffffff?text=Show2'
        }]
      };
    } catch (error) {
      console.error('预加载数据失败:', error);
    }
  };
  useEffect(() => {
    const initApp = async () => {
      try {
        // 并行执行初始化任务和预加载
        await Promise.all([Promise.race([Promise.all([fetchConfig(), checkNetwork(), initSession()]), new Promise(resolve => setTimeout(resolve, 2000)) // 最长等待2秒
        ]), preloadShowsData()]);

        // 计算剩余展示时间
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(2000 - elapsed, 0);

        // 设置导航定时器
        navigationTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            $w.utils.navigateTo({
              pageId: 'shows',
              params: {
                preloadData: JSON.stringify(preloadDataRef.current)
              }
            });
          }
        }, remainingTime);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    initApp();
    return () => {
      // 清理定时器和状态
      mountedRef.current = false;
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);
  const fetchConfig = async () => {
    try {
      // 模拟远端配置拉取
      console.log("拉取配置:", dummyConfig);
      return dummyConfig;
    } catch (error) {
      updateErrorState('service');
      throw error;
    }
  };
  const checkNetwork = async () => {
    try {
      // 模拟网络检测
      const isOnline = Math.random() > 0.2; // 80% 概率模拟网络正常
      if (!isOnline) {
        throw new Error("网络不可用");
      }
      return true;
    } catch {
      updateErrorState('network');
      throw new Error('网络不可用');
    }
  };
  const initSession = async () => {
    // 模拟匿名会话初始化
    console.log("初始化匿名会话");
    return Promise.resolve();
  };
  const updateErrorState = newError => {
    setErrorState(prev => {
      if (ERROR_PRIORITY[newError] > (ERROR_PRIORITY[prev] || 0)) {
        return newError;
      }
      return prev;
    });
  };
  const handleError = error => {
    console.error('初始化错误:', error);
    // 不再显示toast，仅通过遮罩展示错误
  };
  const handleContinue = () => {
    $w.utils.navigateTo({
      pageId: 'shows',
      params: {
        preloadData: JSON.stringify(preloadDataRef.current)
      }
    });
  };
  return <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      {/* 品牌LOGO */}
      <div className="mb-8 animate-fade-in flex flex-col items-center">
        <img src="https://via.placeholder.com/150x150/667eea/ffffff?text=缪幕" alt="缪幕 Logo" className="w-32 h-32 rounded-full shadow-lg dark:shadow-gray-800" />
        <h1 className="mt-4 text-2xl font-bold text-primary">缪幕</h1>
      </div>

      {/* 加载状态 */}
      {loading && <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">正在初始化...</p>
        </div>}

      {/* 错误提示遮罩 */}
      {errorState !== 'none' && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
              {errorState === 'network' ? <>
                  <WifiOff className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">网络不可用</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    当前处于离线状态，将以缓存内容展示
                  </p>
                </> : <>
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">服务暂不可用</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    当前服务遇到问题，部分功能可能受限
                  </p>
                </>}
              <button onClick={handleContinue} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                继续进入
              </button>
            </div>
          </div>
        </div>}
    </div>;
}