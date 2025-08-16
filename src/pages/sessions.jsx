// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

export default function Sessions(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();

  // Dummy数据
  const dummySessions = [{
    id: "1",
    startsAt: "2023-12-25T19:30:00",
    venueName: "国家大剧院·歌剧院",
    defaultLang: "zh",
    langs: ["zh", "en"],
    scriptRef: {
      scriptId: "s1",
      scriptHash: "abc123"
    },
    status: "active"
  }, {
    id: "2",
    startsAt: "2023-12-26T14:00:00",
    venueName: "上海大剧院",
    defaultLang: "zh",
    langs: ["zh"],
    scriptRef: {
      scriptId: "s2",
      scriptHash: "def456"
    },
    status: "ended"
  }];
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 过滤掉draft状态
        const filtered = dummySessions.filter(s => s.status !== "draft");
        setSessions(filtered);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getMonth() + 1}月${date.getDate()}日（周${weekdays[date.getDay()]}）${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const handleSessionClick = session => {
    // 校验逻辑
    if (!session.scriptRef.scriptId) {
      toast({
        title: "无法进入",
        description: "剧本信息缺失",
        variant: "destructive"
      });
      return;
    }
    if (session.status === "ended" || session.status === "archived") {
      return; // 不可点击
    }
    $w.utils.navigateTo({
      pageId: 'player',
      params: {
        sessionId: session.id
      }
    });
  };
  return <div className="flex flex-col h-screen bg-background text-foreground p-4">
      {loading ? <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>)}
        </div> : error ? <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-semibold mb-2">加载失败</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </button>
        </div> : sessions.length === 0 ? <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg font-semibold">本剧暂无场次安排</p>
        </div> : <div className="space-y-2">
          {sessions.map(session => <div key={session.id} onClick={() => handleSessionClick(session)} className={`p-4 rounded-lg border ${session.status === 'active' ? 'bg-card cursor-pointer hover:bg-accent' : 'bg-muted opacity-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatDate(session.startsAt)}</p>
                  <p className="text-sm text-muted-foreground">{session.venueName}</p>
                </div>
                {session.status === 'active' && <ChevronRight className="h-5 w-5" />}
              </div>
            </div>)}
        </div>}
    </div>;
}