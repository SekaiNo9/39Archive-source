import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SongTile from '../components/SongTile';
import { toast, ToastContainer } from 'react-toastify';

export default function SongCollection({ user, setUser }) {
  const base = process.env.REACT_APP_API_URL;
  const [songs, setSongs] = useState([]);
  const [composerList, setComposerList] = useState([]);
  const [performerList, setPerformerList] = useState([]);
  const [query, setQuery] = useState('');
  const [composerFilter, setComposerFilter] = useState('');
  const [performerFilter, setPerformerFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cs, ps, ss] = await Promise.all([
          axios.get(`${base}/composer/all`),
          axios.get(`${base}/performer/all`),
          axios.get(`${base}/song/all`),
        ]);
 
        setComposerList(Array.isArray(cs.data) ? cs.data : []);
        setPerformerList(Array.isArray(ps.data) ? ps.data : []);

        const processedSongs = (ss.data?.data || []).map(s => ({
          ...s,
          composers: s.composers || [],
          performers: s.performers || [],
        }));

        setSongs(processedSongs);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Không lấy được dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [base]);

  const filtered = songs.filter(s => {
    const byQuery = s.title?.toLowerCase().includes(query.toLowerCase());
    const byComposer = composerFilter
      ? s.composers.some(c => {
          const name = typeof c === 'string' ? c : c?.nick_name;
          return name?.toLowerCase() === composerFilter.toLowerCase();
        })
      : true;
    const byPerformer = performerFilter
      ? s.performers.some(p => {
          const name = typeof p === 'string' ? p : p?.nick_name;
          return name?.toLowerCase() === performerFilter.toLowerCase();
        })
      : true;

    return byQuery && byComposer && byPerformer;
  });

  const resetFilters = () => {
    setQuery('');
    setComposerFilter('');
    setPerformerFilter('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-aqua-200 border-t-aqua-500 rounded-full mx-auto mb-4"></div>
          <p className="text-miku-darkCyan text-lg">Đang tải bộ sưu tập...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 animate-glow">
            🎵 Bộ sưu tập bài hát
          </h2>
          <p className="text-lg text-miku-darkCyan opacity-80 mb-2">
            Tìm thấy {songs.length} bài hát tuyệt vời
          </p>
          <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full"></div>
        </div>

        {/* Filter Section - Responsive */}
        <div className="glass-effect p-4 md:p-6 rounded-2xl shadow-miku mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-miku-darkCyan">
                🔍
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm bài hát yêu thích..."
                className="w-full pl-12 pr-4 py-3 border border-aqua-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50"
              />
            </div>

            {/* Filter Dropdowns - Responsive */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-miku-darkCyan">
                  🎼
                </div>
                <select
                  value={composerFilter}
                  onChange={e => setComposerFilter(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-8 py-3 border border-aqua-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all text-miku-darkCyan"
                >
                  <option value="">-- Chọn composer --</option>
                  {composerList.map(c => (
                    <option key={c._id} value={c.nick_name}>
                      {c.nick_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-miku-darkCyan">
                  🎤
                </div>
                <select
                  value={performerFilter}
                  onChange={e => setPerformerFilter(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-8 py-3 border border-aqua-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all text-miku-darkCyan"
                >
                  <option value="">-- Chọn performer --</option>
                  {performerList.map(p => (
                    <option key={p._id} value={p.nick_name}>
                      {p.nick_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="px-6 py-3 glass-effect text-miku-darkCyan rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover-lift"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(query || composerFilter || performerFilter) && (
            <div className="mt-4 pt-4 border-t border-aqua-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-miku-darkCyan font-medium">Bộ lọc hiện tại:</span>
                {query && (
                  <span className="inline-flex items-center gap-1 bg-aqua-100 text-miku-darkCyan px-3 py-1 rounded-full text-sm">
                    🔍 "{query}"
                  </span>
                )}
                {composerFilter && (
                  <span className="inline-flex items-center gap-1 bg-teal-100 text-miku-darkCyan px-3 py-1 rounded-full text-sm">
                    🎼 {composerFilter}
                  </span>
                )}
                {performerFilter && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-miku-darkCyan px-3 py-1 rounded-full text-sm">
                    🎤 {performerFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎵</div>
            <h3 className="text-2xl font-bold text-miku-deep mb-2">
              Không tìm thấy bài hát
            </h3>
            <p className="text-miku-darkCyan opacity-80 mb-6">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <button
              onClick={resetFilters}
              className="bg-gradient-aqua text-white px-8 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
            >
              🔄 Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-miku-darkCyan">
                Hiển thị <span className="font-bold text-miku-deep">{filtered.length}</span> bài hát
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map(s => (
                <div key={s._id} className="hover-lift">
                  <SongTile song={s} user={user} setUser={setUser} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
