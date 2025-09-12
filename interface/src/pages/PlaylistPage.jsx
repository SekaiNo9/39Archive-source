import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon,
  HeartIcon as HeartOutline, 
  PencilIcon,
  TrashIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeAltIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import SongTile from '../components/SongTile';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';

const PlaylistPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, pauseSong } = useMiniPlayer();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const base = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base}/playlist/${id}`, {
        withCredentials: true
      });

      if (res.data.success) {
        const playlistData = res.data.data;
        setPlaylist(playlistData);
        setIsLiked(user ? playlistData.likes?.includes(user._id) : false);
        setLikeCount(playlistData.likeCount || playlistData.likes?.length || 0);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể tải playlist');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && playlist && 
    (playlist.author._id === user._id || playlist.author === user._id);

  const handleTogglePublic = async () => {
    if (!isOwner) return;

    setIsUpdating(true);
    try {
      const res = await axios.put(
        `${base}/playlist/${id}/toggle-public`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setPlaylist(prev => ({
          ...prev,
          is_public: res.data.data.is_public
        }));
      }
    } catch (error) {
      console.error('Error toggling playlist privacy:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!playlist.is_public || isOwner) return;

    try {
      const res = await axios.post(
        `${base}/playlist/${id}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsLiked(res.data.data.isLiked);
        setLikeCount(res.data.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking playlist:', error);
    }
  };

  const handlePlayPlaylist = () => {
    if (playlist.songlist && playlist.songlist.length > 0) {
      const firstSong = playlist.songlist[0];
      playSong(firstSong, playlist.songlist);
    }
  };

  const handlePlaySong = (song, index) => {
    const playlistSongs = playlist.songlist.slice(index);
    playSong(song, playlistSongs);
  };

  const handleDeletePlaylist = async () => {
    if (!isOwner) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa playlist này?')) {
      try {
        const res = await axios.delete(`${base}/playlist/${id}`, {
          withCredentials: true
        });

        if (res.data.success) {
          navigate('/my-archive');
        }
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Đang tải playlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MusicalNoteIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Không thể tải playlist</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-archive')}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-yellow-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Playlist Info Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-64 h-64 bg-amber-100 border-2 border-amber-200 rounded-lg overflow-hidden shadow-xl">
              <img 
                src={playlist.cover_image || '/default.png'}
                alt={playlist.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/default.png';
                }}
              />
            </div>
          </div>

          {/* Playlist Details */}
          <div className="flex-grow">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-800">{playlist.title}</h1>
              {playlist.is_public ? (
                <GlobeAltIcon className="w-6 h-6 text-green-600" title="Công khai" />
              ) : (
                <LockClosedIcon className="w-6 h-6 text-amber-600" title="Riêng tư" />
              )}
            </div>

            <p className="text-xl text-gray-700 mb-2">
              Tạo bởi <span className="text-orange-600 font-semibold">
                {playlist.author?.username || playlist.author?.nick_name || (typeof playlist.author === 'string' ? playlist.author : 'Unknown Artist')}
              </span>
            </p>

            {playlist.description && (
              <p className="text-gray-600 mb-4 max-w-2xl">{playlist.description}</p>
            )}

            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <span>{playlist.songlist?.length || 0} bài hát</span>
              <span>{likeCount} lượt thích</span>
              <span>Cập nhật {new Date(playlist.updateDate).toLocaleDateString('vi-VN')}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Play Button */}
              {playlist.songlist && playlist.songlist.length > 0 && (
                <button
                  onClick={handlePlayPlaylist}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>🎵 Phát tất cả</span>
                </button>
              )}

              {/* Like Button - for non-owners and public playlists */}
              {playlist.is_public && !isOwner && user && (
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                    isLiked
                      ? 'bg-red-500 border-red-500 text-white hover:bg-red-400'
                      : 'border-amber-400 text-amber-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {isLiked ? (
                    <HeartSolid className="w-5 h-5" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )}
                  <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
                </button>
              )}

              {/* Owner Controls */}
              {isOwner && (
                <>
                  {/* Privacy Toggle */}
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {playlist.is_public ? 'Công khai' : 'Riêng tư'}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={playlist.is_public}
                        onChange={handleTogglePublic}
                        disabled={isUpdating}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-amber-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                  </label>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeletePlaylist}
                    className="p-2 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Xóa playlist"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🎵 Danh sách bài hát</h2>
          
          {playlist.songlist && playlist.songlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playlist.songlist.map((song, index) => (
                <SongTile
                  key={song._id}
                  song={song}
                  user={user}
                  onPlay={() => handlePlaySong(song, index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MusicalNoteIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Playlist trống
              </h3>
              <p className="text-gray-600 mb-4">
                {isOwner 
                  ? 'Thêm bài hát vào playlist từ trang chi tiết bài hát'
                  : 'Playlist này chưa có bài hát nào'
                }
              </p>
              {isOwner && (
                <button
                  onClick={() => navigate('/songs')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔍 Tìm bài hát để thêm
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;