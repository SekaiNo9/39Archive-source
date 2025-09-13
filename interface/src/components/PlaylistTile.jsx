import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon as HeartOutline, PlayIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import axios from 'axios';

const PlaylistTile = ({ playlist, user, onLikeUpdate, showControls = true }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(
    user ? playlist.likes?.includes(user._id) : false
  );
  const [likeCount, setLikeCount] = useState(playlist.likeCount || playlist.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);

  const base = process.env.REACT_APP_API_URL;

  const handlePlaylistClick = () => {
    navigate(`/playlist/${playlist._id}`);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!playlist.is_public) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${base}/playlist/${playlist._id}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsLiked(res.data.data.isLiked);
        setLikeCount(res.data.data.likeCount);
        
        if (onLikeUpdate) {
          onLikeUpdate(playlist._id, res.data.data.isLiked, res.data.data.likeCount);
        }
      }
    } catch (error) {
      console.error('Error liking playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    // TODO: Implement play playlist functionality
    if (playlist.songlist && playlist.songlist.length > 0) {
      // Play first song of playlist
      navigate(`/song-detail/${playlist.songlist[0]._id || playlist.songlist[0]}`, {
        state: { playlistId: playlist._id }
      });
    }
  };

  const getPlaylistCover = () => {
    if (playlist.cover_image) {
      return playlist.cover_image;
    }
    
    // Use first song's cover if available
    if (playlist.songlist && playlist.songlist.length > 0 && playlist.songlist[0].url_cover) {
      return playlist.songlist[0].url_cover;
    }
    
    // Default playlist cover
    return '/default.png';
  };

  const isOwner = user && playlist.author && 
    (playlist.author._id === user._id || playlist.author === user._id);

  return (
    <div 
      className="bg-white border-2 border-amber-200 rounded-xl overflow-hidden hover:border-yellow-300 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-105"
      onClick={handlePlaylistClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={getPlaylistCover()}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/default.png';
          }}
        />
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full p-3 transition-all duration-300 transform scale-90 hover:scale-100 shadow-lg"
          >
            <PlayIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Privacy indicator */}
        <div className="absolute top-2 right-2">
          {playlist.is_public ? (
            <GlobeAltIcon className="w-5 h-5 text-green-500 drop-shadow-md" title="Công khai" />
          ) : (
            <LockClosedIcon className="w-5 h-5 text-amber-500 drop-shadow-md" title="Riêng tư" />
          )}
        </div>

        {/* Song count */}
        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
          {playlist.songCount || playlist.songlist?.length || 0} bài
        </div>
      </div>

      {/* Playlist Info */}
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold text-lg mb-1 truncate hover:text-orange-600 transition-colors">
          {playlist.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-2 truncate">
          👤 {playlist.author?.username || playlist.author?.nick_name || (typeof playlist.author === 'string' ? playlist.author : 'Unknown Artist')}
        </p>

        {playlist.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">
            {playlist.description}
          </p>
        )}

        {/* Stats and Actions */}
        {showControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-gray-600 text-sm">
              <div className="flex items-center space-x-1">
                <HeartSolid className="w-4 h-4 text-red-500" />
                <span>{likeCount}</span>
              </div>
              {playlist.updateDate && (
                <span className="text-xs">
                  {new Date(playlist.updateDate).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            {/* Like button - always show for public playlists */}
            {playlist.is_public && user && (
              <button
                onClick={handleLikeClick}
                disabled={isLoading}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full border-2 transition-all duration-200 ${
                  isLiked
                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
                    : 'border-red-200 text-red-500 hover:border-red-500 hover:bg-red-50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLiked ? (
                  <HeartSolid className="w-4 h-4" />
                ) : (
                  <HeartOutline className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isLiked ? 'Đã thích' : 'Thích'}
                </span>
              </button>
            )}

            {/* Show login prompt for non-logged users */}
            {playlist.is_public && !user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login');
                }}
                className="flex items-center space-x-1 px-3 py-1 rounded-full border-2 border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <HeartOutline className="w-4 h-4" />
                <span className="text-sm font-medium">Thích</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistTile;