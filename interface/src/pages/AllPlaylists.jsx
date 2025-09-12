import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import PlaylistTile from '../components/PlaylistTile';

const AllPlaylists = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [authorQuery, setAuthorQuery] = useState(searchParams.get('author') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'likes');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const base = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchPlaylists();
  }, [searchQuery, authorQuery, sortBy, page]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy
      });
      
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      
      if (authorQuery.trim()) {
        params.append('author', authorQuery.trim());
      }

      const res = await axios.get(`${base}/playlist/search?${params.toString()}`);

      if (res.data.success) {
        setPlaylists(res.data.data);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (authorQuery.trim()) params.append('author', authorQuery.trim());
    if (sortBy !== 'likes') params.append('sort', sortBy);
    if (page !== 1) params.append('page', page.toString());
    
    setSearchParams(params);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikeUpdate = (playlistId, isLiked, newLikeCount) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist._id === playlistId 
          ? { ...playlist, likeCount: newLikeCount }
          : playlist
      )
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAuthorQuery('');
    setSortBy('likes');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">🎵 Khám phá Playlist</h1>
          <p className="text-gray-600">
            Tìm kiếm và khám phá những playlist tuyệt vời từ cộng đồng
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-amber-200">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm playlist..."
                    className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-amber-100 hover:bg-amber-200 border-2 border-amber-200 rounded-lg transition-colors text-amber-700"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔍 Tìm kiếm
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm theo tác giả
                  </label>
                  <input
                    type="text"
                    value={authorQuery}
                    onChange={(e) => setAuthorQuery(e.target.value)}
                    placeholder="Nhập tên tác giả..."
                    className="w-full px-3 py-2 bg-white border-2 border-amber-200 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp theo
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-amber-200 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800"
                  >
                    <option value="likes">Lượt thích</option>
                    <option value="date">Ngày cập nhật</option>
                    <option value="title">Tên playlist</option>
                  </select>
                </div>
                
                {(searchQuery || authorQuery || sortBy !== 'likes') && (
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      🗑️ Xóa tất cả bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : playlists.length > 0 ? (
          <>
            {/* Results Info */}
            <div className="mb-6 text-gray-600">
              <p className="font-medium">🎵 Tìm thấy {playlists.length} playlist</p>
            </div>

            {/* Playlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {playlists.map((playlist) => (
                <PlaylistTile
                  key={playlist._id}
                  playlist={playlist}
                  user={user}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-lg transition-colors text-amber-700 disabled:text-gray-400"
                >
                  ← Trước
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === page
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-lg transition-colors text-amber-700 disabled:text-gray-400"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy playlist nào
            </h3>
            <p className="text-gray-600 mb-4">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
            </p>
            {(searchQuery || authorQuery || sortBy !== 'likes') && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🗑️ Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPlaylists;