import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getHistory, getQuiz, deleteQuiz } from '../services/api';
import { Loader2, ArrowRight, Calendar, Trash2, RefreshCw } from 'lucide-react';

const QuizHistory = ({ onRetake }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const data = await getQuiz(id);
            setSelectedQuiz(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await deleteQuiz(id);
                setHistory(prev => prev.filter(item => item.id !== id));
            } catch (err) {
                console.error("Failed to delete quiz", err);
                alert("Failed to delete quiz. Please try again.");
            }
        }
    };

    const closeModal = () => setSelectedQuiz(null);

    const handleCardClick = (e, id) => {
        if (e.target.closest('[data-delete]')) return;
        handleViewDetails(id);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 md:mb-8 text-center">
                Quiz History
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((item) => (
                    <div
                        key={item.id}
                        onClick={(e) => handleCardClick(e, item.id)}
                        className="glass-card hover:bg-white/5 transition-all cursor-pointer group relative pointer-events-none"
                    >
                        {/* ENABLE POINTER EVENTS FOR CONTENT */}
                        <div className="pointer-events-auto">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-500/20 text-blue-300 text-xs font-mono py-1 px-2 rounded">
                                    ID: {item.id}
                                </span>

                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>

                                    <button
                                        data-delete
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="text-red-400 hover:text-red-300 p-3 rounded-full hover:bg-red-500/20 transition-all z-50 relative cursor-pointer pointer-events-auto"
                                        title="Delete Quiz"
                                    >
                                        <Trash2 className="w-4 h-4 pointer-events-none" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-base md:text-lg font-semibold mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                {item.title || "Untitled Quiz"}
                            </h3>

                            <p className="text-slate-400 text-sm mb-4 line-clamp-1">
                                {item.url}
                            </p>

                            <button className="w-full py-2 bg-slate-800 rounded text-sm font-medium text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center cursor-pointer">
                                View Analysis <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {history.length === 0 && (
                <div className="text-center text-slate-500 py-12">
                    No history found. Generate your first quiz!
                </div>
            )}

            {selectedQuiz && createPortal(
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
                    onClick={closeModal}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-4 md:p-6 shadow-2xl mt-16 md:mt-0"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg md:text-2xl font-bold text-white line-clamp-1 mr-4">
                                {selectedQuiz.title}
                            </h2>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => onRetake(selectedQuiz)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retake
                                </button>

                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-white text-xl"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {selectedQuiz.quiz.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                                >
                                    <h4 className="font-semibold text-lg mb-3">
                                        Q{idx + 1}. {q.question_text || q.question}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        {q.options.map((opt, i) => (
                                            <div
                                                key={i}
                                                className={`p-2 rounded border ${opt === q.correct_answer
                                                    ? 'border-green-500/50 bg-green-900/20'
                                                    : 'border-slate-700'
                                                    }`}
                                            >
                                                <span className="font-bold opacity-50 mr-2">
                                                    {String.fromCharCode(65 + i)}.
                                                </span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-sm text-slate-400 border-l-2 border-blue-500 pl-3">
                                        {q.explanation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default QuizHistory;
