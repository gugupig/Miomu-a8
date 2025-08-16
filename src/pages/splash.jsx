// @ts-ignore;
import React, { useState, useEffect } from 'react';
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
  const [networkError, setNetworkError] = useState(false);
  const [serviceError, setServiceError] = useState(false);

  // Dummy 数据用于 debug 和展示
  const dummyConfig = {
    serviceAvailable: true,
    announcement: "欢迎使用缪幕小程序",
    theme: "light"
  };
  useEffect(() => {
    const initApp = async () => {
      try {
        // 模拟并行任务
        await Promise.all([fetchConfig(), checkNetwork(), initSession()]);

        // 所有任务完成后跳转
        setTimeout(() => {
          $w.utils.navigateTo({
            pageId: 'shows',
            params: {}
          });
        }, 2000); // 确保至少展示2秒LOGO
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);
  const fetchConfig = async () => {
    try {
      // 模拟远端配置拉取
      console.log("拉取配置:", dummyConfig);
      return dummyConfig;
    } catch (error) {
      setServiceError(true);
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
      setNetworkError(true);
      throw new Error('网络不可用');
    }
  };
  const initSession = async () => {
    // 模拟匿名会话初始化
    console.log("初始化匿名会话");
    return Promise.resolve();
  };
  const handleError = error => {
    console.error('初始化错误:', error);
    toast({
      title: '初始化失败',
      description: error.message || '未知错误',
      variant: 'destructive'
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

      {/* 网络错误提示 */}
      {networkError && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
              <WifiOff className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">网络不可用</h3>
              <p className="text-sm text-muted-foreground mb-6">
                当前处于离线状态，将以缓存内容展示
              </p>
              <button onClick={() => $w.utils.navigateTo({
            pageId: 'shows',
            params: {}
          })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                继续进入
              </button>
            </div>
          </div>
        </div>}

      {/* 服务错误提示 */}
      {serviceError && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">服务暂不可用</h3>
              <p className="text-sm text-muted-foreground mb-6">
                当前服务遇到问题，部分功能可能受限
              </p>
              <button onClick={() => $w.utils.navigateTo({
            pageId: 'shows',
            params: {}
          })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                继续进入
              </button>
            </div>
          </div>
        </div>}
    </div>;
}