import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import ParticleBackground from './ParticleBackground'; // Import
import { generateQuiz } from '../services/api';
import { Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, Sparkles, Search } from 'lucide-react';




const LOADING_MESSAGES = [
    "Getting your quiz ready… just a moment.",
    "Preparing questions that match your skill…",
    "Setting up something interesting for you…",
    "Almost there… polishing your quiz experience.",
    "Loading smart questions… stay with us.",
    "Finding the best questions for you…"
];

const CreateQuiz = ({ initialQuizData, onReset }) => {
    // Input State
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topic, setTopic] = useState(''); // Added topic state

    // Quiz State
    const [quizData, setQuizData] = useState(initialQuizData || null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]); // Store history of answers

    // Window size for Confetti
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Loading Message State
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        if (loading) {
            // Set initial random message
            setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
        }
    }, [loading]);

    const handleAnimationIteration = () => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    };

    // Sound state ref to track if sound has played for current result
    const hasPlayedSound = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset sound flag when results are hidden or quiz resets
    useEffect(() => {
        if (!showResults) {
            hasPlayedSound.current = false;
        }
    }, [showResults]);

    // Sound Effect at Results
    useEffect(() => {
        if (showResults && quizData && !hasPlayedSound.current) {
            const percentage = Math.round((score / quizData.quiz.length) * 100);
            const soundFile = percentage > 50 ? '/sounds/celebration.wav' : '/sounds/encourage.wav';

            // Mark as played so it doesn't fire again for this result session
            hasPlayedSound.current = true;

            // Play immediately to preserve user gesture token
            const audio = new Audio(soundFile);
            audio.play().catch(e => console.log("Audio play failed:", e));

        }
    }, [showResults, quizData, score]);

    // Effect to update internal state if prop changes (e.g. starting a new retake)
    React.useEffect(() => {
        if (initialQuizData) {
            setQuizData(initialQuizData);
            setUrl(initialQuizData.url || '');
            setCurrentIndex(0);
            setScore(0);
            setShowResults(false);
            setUserAnswers([]);
            setIsAnswerChecked(false);
            setSelectedOption(null);
        }
    }, [initialQuizData]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQuizData(null);
        // Reset quiz state
        setCurrentIndex(0);
        setScore(0);
        setShowResults(false);
        setUserAnswers([]);

        try {
            const data = await generateQuiz(url);
            setQuizData(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option) => {
        if (isAnswerChecked) return;
        setSelectedOption(option);
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;

        const currentQuestion = quizData.quiz[currentIndex];
        const isCorrect = selectedOption === currentQuestion.correct_answer;

        setIsAnswerChecked(true);
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Save answer for review
        setUserAnswers(prev => [...prev, {
            questionIndex: currentIndex,
            selected: selectedOption,
            correct: currentQuestion.correct_answer,
            isCorrect: isCorrect
        }]);
    };

    const handleNextQuestion = () => {
        if (currentIndex < quizData.quiz.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
        } else {
            setShowResults(true);
        }
    };

    const restartQuiz = () => {
        setQuizData(null);
        setUrl('');
        setCurrentIndex(0);
        setScore(0);
        setShowResults(false);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setUserAnswers([]);
        if (onReset) onReset();
    };

    // 1. Input View
    if (!quizData) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 fade-in relative z-10">
                <ParticleBackground />
                <div className="glass-card text-center space-y-8 py-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Generate Quiz from Wikipedia
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base">
                            Enter any topic (e.g., "Quantum Physics") or paste a Wikipedia URL.
                        </p>
                    </div>

                    <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Type a topic or paste a URL..."
                            className="input-field"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary flex items-center justify-center w-full py-3 text-lg cursor-pointer overflow-hidden ${loading ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                            {loading ? (
                                <div className="w-full overflow-hidden relative h-7 flex items-center justify-center">
                                    <span
                                        className="animate-marquee whitespace-nowrap font-medium text-base"
                                        onAnimationIteration={handleAnimationIteration}
                                    >
                                        {loadingMessage}
                                    </span>
                                </div>
                            ) : (
                                'Generate Quiz'
                            )}
                        </button>
                    </form>
                    {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
                </div>
            </div>
        );
    }

    // 2. Results View
    if (showResults) {
        const percentage = Math.round((score / quizData.quiz.length) * 100);
        const isSuccess = percentage >= 50;

        return (
            <div className="max-w-3xl mx-auto space-y-8 fade-in relative">
                {windowSize.width > 0 && <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={isSuccess ? 500 : 200}
                    gravity={isSuccess ? 0.1 : 0.8} // Fall fast like rain if failure
                    colors={isSuccess ? undefined : ['#4B5563', '#6B7280', '#9CA3AF', '#3B82F6', '#60A5FA']} // Grays and Blues for rain
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}
                />}
                <div className="glass-card text-center py-8 md:py-10 space-y-4 md:space-y-6 relative z-10">
                    <div className="bg-yellow-500/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto border border-yellow-500/30">
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                        <p className="text-slate-400 text-sm md:text-base">Here is how you performed</p>
                    </div>

                    <div className="flex justify-center gap-8 py-4">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-400">{score}/{quizData.quiz.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-purple-400">{percentage}%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Accuracy</div>
                        </div>
                    </div>

                    <button onClick={restartQuiz} className="btn-primary inline-flex items-center px-6 md:px-8 text-sm md:text-base cursor-pointer">
                        <RefreshCw className="mr-2 w-4 h-4" /> Try Another Wiki
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-bold text-slate-300 px-2">Review Answers</h3>
                    {quizData.quiz.map((q, idx) => {
                        const userAnswer = userAnswers.find(a => a.questionIndex === idx);
                        return (
                            <div key={idx} className="glass-card opacity-90">
                                <p className="font-semibold text-base md:text-lg mb-4 text-white">
                                    <span className="text-slate-500 mr-2">{idx + 1}.</span> {q.question_text || q.question}
                                </p>
                                <div className="space-y-2">
                                    <div className={`p-2 md:p-3 rounded-lg border flex justify-between items-center text-sm md:text-base
                                        ${userAnswer?.isCorrect
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        <span>Your Answer: <span className="font-bold">{userAnswer?.selected}</span></span>
                                        {userAnswer?.isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 ml-2" /> : <XCircle className="w-5 h-5 shrink-0 ml-2" />}
                                    </div>
                                    {!userAnswer?.isCorrect && (
                                        <div className="p-2 md:p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex justify-between items-center text-sm md:text-base">
                                            <span>Correct Answer: <span className="font-bold">{q.correct_answer}</span></span>
                                            <CheckCircle2 className="w-5 h-5 shrink-0 ml-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 3. Playing View
    const currentQuestion = quizData.quiz[currentIndex];
    const progress = ((currentIndex + 1) / quizData.quiz.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
            {/* Header / Topic Info */}
            <div className="flex justify-between items-center text-slate-400 text-sm px-1">
                <div className="flex flex-col">
                    <span>Subject: <span className="text-white font-semibold line-clamp-1">{quizData.title}</span></span>
                    <span>Question {currentIndex + 1} of {quizData.quiz.length}</span>
                </div>
                <button
                    onClick={restartQuiz}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Exit Quiz"
                >
                    <XCircle className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="glass-card space-y-6 md:space-y-8 min-h-[400px] flex flex-col justify-between">
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-2">
                        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-white">
                            {currentQuestion.question_text || currentQuestion.question}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start
                            ${currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'}`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, idx) => {
                            let optionClass = "p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-200 font-medium text-sm md:text-base ";

                            if (isAnswerChecked) {
                                if (option === currentQuestion.correct_answer) {
                                    optionClass += "bg-green-500/20 border-green-500 text-green-400";
                                } else if (option === selectedOption) {
                                    optionClass += "bg-red-500/20 border-red-500 text-red-400";
                                } else {
                                    optionClass += "bg-slate-800/50 border-slate-700 text-slate-500 opacity-50";
                                }
                            } else {
                                if (selectedOption === option) {
                                    optionClass += "bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10";
                                } else {
                                    optionClass += "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswerChecked}
                                    className={optionClass}
                                >
                                    <span className="mr-3 opacity-60 font-mono">{String.fromCharCode(65 + idx)}.</span>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Feedback Text */}
                    <div className="w-full sm:w-auto">
                        {isAnswerChecked && (
                            <div className={`flex items-center justify-center sm:justify-start font-bold ${selectedOption === currentQuestion.correct_answer ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedOption === currentQuestion.correct_answer ? (
                                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Correct!</>
                                ) : (
                                    <><XCircle className="w-5 h-5 mr-2" /> Incorrect</>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="w-full sm:w-auto">
                        {!isAnswerChecked ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={!selectedOption}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 w-full sm:w-auto"
                            >
                                Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="bg-white text-slate-900 hover:bg-slate-200 font-bold py-2 px-8 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto"
                            >
                                {currentIndex === quizData.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;
