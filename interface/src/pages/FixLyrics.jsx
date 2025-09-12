import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FixLyrics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [song, setSong] = useState(null);
    const [lyrics, setLyrics] = useState([{ start_time: 0, line: '' }]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        const fetchSong = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/song/${id}`);
                setSong(response.data);
                if (response.data.lyrics && Array.isArray(response.data.lyrics)) {
                    setLyrics(response.data.lyrics.map(l => ({
                        start_time: l.start_time ?? 0,
                        line: l.line ?? ''
                    })));
                }
            } catch (err) {
                setError('Không tìm thấy bài hát!');
            } finally {
                setLoading(false);
            }
        };
        fetchSong();
    }, [id]);

    const handleChange = (index, field, value) => {
        const newLyrics = lyrics.map((row, i) =>
            i === index ? { ...row, [field]: field === 'start_time' ? Number(value) : value } : row
        );
        setLyrics(newLyrics);
    };

    const handleAddRow = () => {
        setLyrics([...lyrics, { start_time: 0, line: '' }]);
    };

    const handleRemoveRow = (index) => {
        console.log('Removing row at index:', index);
        console.log('Current lyrics length:', lyrics.length);
        setLyrics(lyrics.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/song/${id}/update-lyrics`, { lyric: lyrics });
            navigate(`/song-detail/${id}`);
        } catch (err) {
            console.error(err);
            setError('Cập nhật lời bài hát thất bại!');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-aqua-200 border-t-aqua-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-miku-darkCyan text-lg">Đang tải bài hát...</p>
                </div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-8xl mb-6">🎵</div>
                    <h2 className="text-2xl font-bold text-miku-deep mb-4">Không tìm thấy bài hát</h2>
                    <p className="text-miku-darkCyan mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/song-collection')}
                        className="bg-gradient-aqua text-white px-8 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
                    >
                        🔙 Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-20 w-40 h-40 bg-miku-mint opacity-10 rounded-full animate-float"></div>
                <div className="absolute bottom-20 left-10 w-32 h-32 bg-aqua-300 opacity-20 rounded-full animate-pulse-soft"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
                        🎤 Sửa lời bài hát
                    </h2>
                    <div className="glass-effect p-4 rounded-xl inline-block">
                        <p className="text-lg font-medium text-miku-darkCyan">
                            🎵 <span className="text-miku-deep">{song.title}</span>
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 88%, rgba(57,208,216,0.1) 12%)'}} className="p-8 rounded-2xl shadow-miku border border-aqua-200">
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Lyrics Table */}
                        <div className="overflow-hidden rounded-lg border-2 border-gray-800">
                            <div className="bg-gradient-aqua text-white px-6 py-3">
                                <div className="grid grid-cols-12 gap-4 font-medium">
                                    <div className="col-span-2">⏱️ Thời gian (s)</div>
                                    <div className="col-span-8">🎵 Lời bài hát</div>
                                    <div className="col-span-2 text-center">🛠️ Thao tác</div>
                                </div>
                            </div>
                            
                            <div className="bg-white max-h-96 overflow-y-auto">
                                {lyrics.map((row, idx) => (
                                    <div key={idx} className={`grid grid-cols-12 gap-4 p-4 items-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.1"
                                                value={row.start_time}
                                                onChange={e => handleChange(idx, 'start_time', e.target.value)}
                                                className="w-full border-2 border-gray-800 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all text-center font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-span-8">
                                            <input
                                                type="text"
                                                value={row.line}
                                                onChange={e => handleChange(idx, 'line', e.target.value)}
                                                className="w-full border-2 border-gray-800 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                                                placeholder="Nhập lời bài hát tại đây..."
                                            />
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRow(idx)}
                                                className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600 transition-colors text-sm"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Row Button */}
                        <div className="text-center">
                            <button
                                type="button"
                                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium hover-lift"
                                onClick={handleAddRow}
                            >
                                ➕ Thêm dòng mới
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 pt-6 border-t border-aqua-200">
                            <button
                                type="submit"
                                className="bg-gradient-aqua text-white px-8 py-3 rounded-lg hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
                            >
                                💾 Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                className="glass-effect text-miku-darkCyan px-8 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover-lift border border-aqua-200"
                                onClick={() => navigate(`/song-detail/${id}`)}
                            >
                                🔙 Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FixLyrics;
