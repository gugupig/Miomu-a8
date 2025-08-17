// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, RefreshCw, ChevronRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Sessions(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [showInfo, setShowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showPastSessions, setShowPastSessions] = useState(false);
  const abortControllerRef = useRef(null);

  // 时间格式化工具函数
  const formatDateTime = isoString => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (e) {
      console.error('日期格式化错误:', e);
      return isoString;
    }
  };

  // 分组场次数据
  const groupSessions = sessions => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    sessions.forEach(session => {
      const sessionDate = new Date(session.startsAt);
      if (sessionDate >= now) {
        upcoming.push(session);
      } else {
        past.push(session);
      }
    });

    // 按时间升序排序
    upcoming.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    past.sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
    return {
      upcoming,
      past
    };
  };

  // 修改后的dummy数据，使用ISO 8601格式
  const dummySessions = [{
    id: '1',
    startsAt: '2023-08-20T19:30:00+08:00',
    venue: '国家大剧院',
    status: 'available',
    scriptId: "script1",
    scriptHash: "abc123",
    defaultLang: "zh",
    langs: ["zh", "en", "ja"]
  }, {
    id: '2',
    startsAt: '2023-08-18T19:30:00+08:00',
    venue: '国家大剧院',
    status: 'available',
    scriptId: "script1",
    scriptHash: "abc123",
    defaultLang: "zh",
    langs: ["zh", "en", "ja"]
  }, {
    id: '3',
    startsAt: '2023-08-25T19:30:00+08:00',
    venue: '国家大剧院',
    status: 'available',
    scriptId: "script1",
    scriptHash: "abc123",
    defaultLang: "zh",
    langs: ["zh", "en", "ja"]
  }];
  const dummyShowInfo = {
    title: "剧目名称",
    poster: "https://via.placeholder.com/300x450/667eea/ffffff?text=Show+Poster",
    gallery: ["https://via.placeholder.com/600x400/667eea/ffffff?text=Gallery+1", "https://via.placeholder.com/600x400/667eea/ffffff?text=Gallery+2"],
    videos: [{
      thumbnail: "https://via.placeholder.com/300x200/667eea/ffffff?text=Trailer",
      url: "https://example.com/video1"
    }],
    description: "这是一段详细的剧目描述，包含剧情梗概、演出时长等信息。",
    duration: "120分钟",
    ageRating: "12+",
    cast: [{
      name: "演员一",
      role: "角色一",
      avatar: "https://via.placeholder.com/100/667eea/ffffff?text=A"
    }, {
      name: "演员二",
      role: "角色二",
      avatar: "https://via.placeholder.com/100/667eea/ffffff?text=B"
    }],
    faqs: [{
      question: "常见问题一",
      answer: "问题一的解答"
    }, {
      question: "常见问题二",
      answer: "问题二的解答"
    }]
  };

  // 加载数据函数
  const fetchData = async () => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      setLoading(true);
      setError(null);
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          if (Math.random() < 0.3 && retryCount < 2) {
            reject(new Error('模拟数据加载失败'));
            return;
          }
          setSessions(dummySessions.filter(s => s.status !== "draft"));
          setShowInfo(dummyShowInfo);
          resolve();
        }, 1000);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        setRetryCount(prev => prev + 1);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [retryCount]);

  // 修改后的跳转逻辑，添加scriptHash校验
  const handleSessionClick = session => {
    try {
      if (!session.scriptHash) {
        throw new Error('剧本信息不完整，缺少scriptHash');
      }

      // 仅传递必要字段
      $w.utils.navigateTo({
        pageId: 'player',
        params: {
          sessionId: session.id,
          scriptId: session.scriptId,
          scriptHash: session.scriptHash,
          defaultLang: session.defaultLang
        }
      });
    } catch (err) {
      toast({
        title: '操作失败',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // 渲染场次列表项
  const renderSessionItem = session => {
    const formattedDate = formatDateTime(session.startsAt);
    return <div key={session.id} className="p-4 bg-card rounded-lg flex justify-between items-center hover:bg-accent transition-colors cursor-pointer" onClick={() => handleSessionClick(session)}>
        <div>
          <p className="font-medium">{formattedDate}</p>
          <p className="text-sm text-muted-foreground">{session.venue}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>;
  };
  const renderSessionsTab = () => {
    if (loading) {
      return <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>;
    }
    if (error) {
      return <div className="flex flex-col items-center justify-center h-64 p-4">
        <AlertCircle className="w-8 h-8 text-destructive mb-2" />
        <p className="text-center text-destructive mb-4">加载失败: {error.message}</p>
        <button className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </button>
      </div>;
    }
    const {
      upcoming,
      past
    } = groupSessions(sessions);
    return <div className="space-y-4 p-4">
      {upcoming.length > 0 && <div className="space-y-2">
        <h3 className="font-medium text-lg">即将上演</h3>
        {upcoming.map(renderSessionItem)}
      </div>}
      
      {past.length > 0 && <div className="space-y-2">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPastSessions(!showPastSessions)}>
          <h3 className="font-medium text-lg">历史场次</h3>
          {showPastSessions ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
        {showPastSessions && past.map(renderSessionItem)}
      </div>}
    </div>;
  };
  const renderShowInfoTab = () => {
    if (loading) return <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>)}
      </div>;
    if (!showInfo) return <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-semibold">剧目信息加载失败</p>
      </div>;
    return <div className="space-y-6 pb-20">
        {/* 主视觉 */}
        <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
          <img src={showInfo.poster} alt={showInfo.title} className="w-full h-full object-cover" />
        </div>

        {/* 基本信息 */}
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-bold mb-2">{showInfo.title}</h2>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>{showInfo.duration} | {showInfo.ageRating}</span>
          </div>
          <p className="text-sm">{showInfo.description}</p>
        </div>

        {/* 主创团队 */}
        <div>
          <h3 className="text-lg font-semibold px-4 mb-2">主创团队</h3>
          <div className="overflow-x-auto px-4">
            <div className="flex space-x-4 pb-2">
              {showInfo.cast.map((person, i) => <div key={i} className="flex-shrink-0 w-24 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2">
                    <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                </div>)}
            </div>
          </div>
        </div>

        {/* 媒体内容 */}
        <div>
          <h3 className="text-lg font-semibold px-4 mb-2">剧照</h3>
          <div className="grid grid-cols-2 gap-2 px-4">
            {showInfo.gallery.map((img, i) => <div key={i} className="aspect-square bg-muted rounded overflow-hidden">
                <img src={img} alt={`剧照${i + 1}`} className="w-full h-full object-cover" />
              </div>)}
          </div>
        </div>

        {/* 视频 */}
        {showInfo.videos.length > 0 && <div>
            <h3 className="text-lg font-semibold px-4 mb-2">视频</h3>
            <div className="px-4">
              {showInfo.videos.map((video, i) => <div key={i} className="aspect-video bg-muted rounded overflow-hidden">
                  <img src={video.thumbnail} alt={`视频${i + 1}`} className="w-full h-full object-cover" />
                </div>)}
            </div>
          </div>}

        {/* FAQ */}
        <div className="px-4">
          <h3 className="text-lg font-semibold mb-2">常见问题</h3>
          <div className="space-y-2">
            {showInfo.faqs.map((faq, i) => <div key={i} className="bg-card rounded-lg p-3">
                <p className="font-medium">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>)}
          </div>
        </div>
      </div>;
  };
  return <div className="flex flex-col h-screen bg-background text-foreground">
      {/* TAB栏 */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex">
          <button className={`flex-1 py-3 text-center font-medium ${activeTab === 'sessions' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setActiveTab('sessions')}>
            场次
          </button>
          <button className={`flex-1 py-3 text-center font-medium ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setActiveTab('info')}>
            剧目信息
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sessions' ? renderSessionsTab() : renderShowInfoTab()}
      </div>
    </div>;
}