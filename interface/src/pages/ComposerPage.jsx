import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ComposerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [composer, setComposer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchComposer = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/composer/${id}`);
                setComposer(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchComposer();
    }, [id]);
 
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin w-12 h-12 border-4 border-aqua-200 border-t-aqua-500 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6">
            {/* Header */}
            <div className="glass-effect p-8 rounded-2xl shadow-miku mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-miku-deep mb-2 animate-glow">
                            {composer ? `🎵 ${composer.nick_name}` : "❌ Không tìm thấy composer!"}
                        </h1>
                        {composer && (
                            <p className="text-lg text-miku-darkCyan opacity-80">
                                Nhạc sĩ tài năng
                            </p>
                        )}
                    </div>
                    <button
                        className="group bg-gradient-aqua text-white border-2 border-transparent rounded-full px-8 py-3 flex items-center justify-center text-lg font-bold shadow-aqua-lg hover:shadow-glow transition-all duration-300 hover-lift"
                        title="Thêm Composer mới"
                        onClick={() => navigate('/composer/add')}
                    >
                        <span className="flex items-center gap-2">
                            ➕ <span>Thêm Composer</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Composer Details */}
            {composer && (
                <div className="glass-effect p-8 rounded-2xl shadow-miku">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0 text-center">
                            <div className="relative inline-block">
                                <img 
                                    src={`${process.env.REACT_APP_API_URL}${composer.url_avt}`} 
                                    alt={`${composer.nick_name} Avatar`} 
                                    className="w-64 h-64 object-cover rounded-2xl shadow-aqua-lg hover:shadow-glow transition-all duration-300" 
                                />
                                <div className="absolute inset-0 bg-gradient-aqua opacity-0 hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🌍</span>
                                        <h3 className="font-bold text-miku-deep">Quốc gia</h3>
                                    </div>
                                    <p className="text-miku-darkCyan">{composer.country}</p>
                                </div>

                                <div className="bg-white/50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">⏰</span>
                                        <h3 className="font-bold text-miku-deep">Thời gian hoạt động</h3>
                                    </div>
                                    <p className="text-miku-darkCyan">{composer.active_time} tháng</p>
                                </div>
                            </div>

                            <div className="bg-white/50 p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">📝</span>
                                    <h3 className="font-bold text-miku-deep">Mô tả</h3>
                                </div>
                                <p className="text-miku-darkCyan leading-relaxed">{composer.description}</p>
                            </div>

                            <div className="bg-white/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🔗</span>
                                    <h3 className="font-bold text-miku-deep">Liên kết xã hội</h3>
                                </div>
                                <a 
                                    href={composer.social_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gradient-aqua text-white px-6 py-2 rounded-full hover:shadow-aqua-lg transition-all duration-300 hover-lift font-medium"
                                >
                                    🌐 <span>Xem Profile</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComposerPage;