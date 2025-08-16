// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, ImageOff } from 'lucide-react';

export default function Shows(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();

  // Dummy 数据用于 debug 和展示
  const dummyShows = [{
    _id: "1",
    posterUrl: "https://via.placeholder.com/300x450/667eea/ffffff?text=Show+1",
    title: "剧目一",
    tags: "热门"
  }, {
    _id: "2",
    posterUrl: "https://via.placeholder.com/300x450/667eea/ffffff?text=Show+2",
    title: "剧目二",
    tags: "新上"
  }, {
    _id: "3",
    posterUrl: "https://via.placeholder.com/300x450/667eea/ffffff?text=Show+3",
    title: "剧目三",
    tags: "经典"
  }];
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchShows = async () => {
      try {
        // 模拟数据加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 使用 dummy 数据
        setShows(dummyShows);
      } catch (err) {
        setError(err);
        toast({
          title: '加载失败',
          description: err.message || '未知错误',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);
  const handleShowClick = showId => {
    $w.utils.navigateTo({
      pageId: 'sessions',
      params: {
        showId
      }
    });
  };
  return <div className="flex flex-col h-screen bg-background text-foreground">
      {loading ? <div className="space-y-4 p-4">
          {[...Array(5)].map((_, index) => <div key={index} className="h-32 bg-muted rounded animate-pulse"></div>)}
        </div> : error ? <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-semibold mb-2">加载失败</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              重试
          </button>
        </div> : shows.length === 0 ? <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg font-semibold">暂无剧目安排</p>
        </div> : <div className="space-y-4 p-4">
          {shows.map(show => <div key={show._id} className="relative h-32 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleShowClick(show._id)}>
              <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover" onError={e => {
          e.target.src = 'https://via.placeholder.com/300x150';
          e.target.onerror = null;
        }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2">{show.title}</h3>
              </div>
              <div className="absolute bottom-0 right-0 p-4">
                  {show.tags && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      {show.tags}
                  </span>}
              </div>
          </div>)}
        </div>}
    </div>;
}