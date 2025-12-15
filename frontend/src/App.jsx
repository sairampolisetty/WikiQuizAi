import React, { useState } from 'react';
import CreateQuiz from './components/CreateQuiz';
import QuizHistory from './components/QuizHistory';
import { Sparkles, History, Menu, X } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quizKey, setQuizKey] = useState(0); // Key to force remount of CreateQuiz

  const handleRetake = (quizData) => {
    setCurrentQuiz(quizData);
    setActiveTab('create');
    setIsMenuOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveTab('create');
    setIsMenuOpen(false);
    setCurrentQuiz(null);
    setQuizKey(prev => prev + 1); // Force reset to input view
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2" onClick={handleLogoClick}>
              <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white cursor-pointer" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent cursor-pointer hidden md:block">
                WikiQuiz AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${activeTab === 'create'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } `}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${activeTab === 'history'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } `}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl absolute w-full z-50 animate-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-2 shadow-2xl">
              <button
                onClick={() => handleTabChange('create')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all cursor-pointer
                  ${activeTab === 'create'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } `}
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Generate Quiz
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all cursor-pointer
                  ${activeTab === 'history'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } `}
              >
                <History className="w-5 h-5 mr-3" />
                History
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full relative z-10">
        <div className="fade-in">
          {activeTab === 'create'
            ? <CreateQuiz key={quizKey} initialQuizData={currentQuiz} onReset={() => setCurrentQuiz(null)} />
            : <QuizHistory onRetake={handleRetake} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto py-8 text-center text-slate-500 text-sm">
        <p>Powered by Gemini AI • Built with FastAPI & React</p>
      </footer>
    </div>
  );
}

export default App;
