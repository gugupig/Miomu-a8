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
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [showInfo, setShowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy数据
  const dummySessions = [{
    id: '1',
    date: '2023-06-15',
    time: '19:30',
    venue: '国家大剧院',
    status: 'available',
    scriptRef: {
      scriptId: "script1",
      scriptHash: "abc123",
      defaultLang: "zh",
      langs: ["zh", "en", "ja"]
    }
  }, {
    id: '2',
    date: '2023-06-16',
    time: '19:30',
    venue: '国家大剧院',
    status: 'available',
    scriptRef: {
      scriptId: "script1",
      scriptHash: "abc123",
      defaultLang: "zh",
      langs: ["zh", "en", "ja"]
    }
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 加载场次数据
        setSessions(dummySessions.filter(s => s.status !== "draft"));
        // 加载剧目信息
        setShowInfo(dummyShowInfo);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleSessionClick = session => {
    $w.utils.navigateTo({
      pageId: 'player',
      params: {
        sessionId: session.id,
        scriptRef: JSON.stringify(session.scriptRef)
      }
    });
  };
  const renderSessionsTab = () => <div className="space-y-4 p-4">
      {sessions.map(session => <div key={session.id} className="p-4 bg-card rounded-lg flex justify-between items-center" onClick={() => handleSessionClick(session)}>
          <div>
            <p className="font-medium">{session.date} {session.time}</p>
            <p className="text-sm text-muted-foreground">{session.venue}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>)}
    </div>;
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