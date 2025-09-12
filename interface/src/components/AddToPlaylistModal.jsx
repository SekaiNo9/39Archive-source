import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const AddToPlaylistModal = ({ isOpen, onClose, songId, user }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [selectedChanges, setSelectedChanges] = useState({});

  const base = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (isOpen && user) {
      fetchUserPlaylists();
    }
  }, [isOpen, songId, user]);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${base}/playlist/user/${songId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setPlaylists(res.data.data);
        // Reset selected changes when modal opens
        setSelectedChanges({});
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistToggle = (playlistId, currentlyHasSong) => {
    setSelectedChanges(prev => ({
      ...prev,
      [playlistId]: !currentlyHasSong
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(selectedChanges).length === 0) {
      onClose();
      return;
    }

    setUpdating({ all: true });

    try {
      const promises = Object.entries(selectedChanges).map(async ([playlistId, shouldAdd]) => {
        if (shouldAdd) {
          // Add song to playlist
          return axios.post(
            `${base}/playlist/${playlistId}/add-song`,
            { songId },
            { withCredentials: true }
          );
        } else {
          // Remove song from playlist
          return axios.delete(
            `${base}/playlist/${playlistId}/remove-song/${songId}`,
            { withCredentials: true }
          );
        }
      });

      await Promise.all(promises);
      
      // Refresh playlist data
      await fetchUserPlaylists();
      
      onClose();
    } catch (error) {
      console.error('Error updating playlists:', error);
    } finally {
      setUpdating({});
    }
  };

  const createNewPlaylist = () => {
    // Close modal and navigate to create playlist
    onClose();
    window.location.href = '/create-playlist';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-96 flex flex-col shadow-2xl border-2 border-amber-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <h3 className="text-lg font-semibold text-gray-800">🎵 Thêm vào playlist</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Create New Playlist Option */}
              <button
                onClick={createNewPlaylist}
                className="w-full flex items-center space-x-3 p-3 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded flex items-center justify-center">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 font-medium">✨ Tạo playlist mới</span>
              </button>

              {/* Divider */}
              {playlists.length > 0 && (
                <div className="border-t border-amber-200 my-3"></div>
              )}

              {/* Existing Playlists */}
              {playlists.map((playlist) => {
                const isCurrentlyInPlaylist = playlist.hasSong;
                const willBeInPlaylist = selectedChanges.hasOwnProperty(playlist._id) 
                  ? selectedChanges[playlist._id] 
                  : isCurrentlyInPlaylist;

                return (
                  <button
                    key={playlist._id}
                    onClick={() => handlePlaylistToggle(playlist._id, isCurrentlyInPlaylist)}
                    disabled={updating.all}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-yellow-200"
                  >
                    <div className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${
                      willBeInPlaylist
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500'
                        : 'border-amber-300 bg-amber-50'
                    }`}>
                      {willBeInPlaylist && (
                        <CheckIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-gray-800 flex-1 text-left font-medium">{playlist.title}</span>
                    
                    {/* Show change indicator */}
                    {selectedChanges.hasOwnProperty(playlist._id) && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        selectedChanges[playlist._id]
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {selectedChanges[playlist._id] ? '+ Thêm' : '- Xóa'}
                      </span>
                    )}
                  </button>
                );
              })}

              {playlists.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎶</div>
                  <p className="text-gray-600 mb-4">Bạn chưa có playlist nào</p>
                  <button
                    onClick={createNewPlaylist}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    ✨ Tạo playlist đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {playlists.length > 0 && (
          <div className="flex justify-end space-x-3 p-4 border-t border-amber-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <button
              onClick={onClose}
              disabled={updating.all}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              ❌ Hủy
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={updating.all || Object.keys(selectedChanges).length === 0}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {updating.all ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>
                  💾 Lưu thay đổi {Object.keys(selectedChanges).length > 0 && `(${Object.keys(selectedChanges).length})`}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;