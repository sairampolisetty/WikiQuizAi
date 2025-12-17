import React from 'react';

const InfinityLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <svg
                viewBox="0 0 100 50"
                className="w-24 h-12 stroke-current text-blue-500"
            >
                <path
                    d="M25,25 C25,40 5,40 5,25 C5,10 25,10 25,25 C25,40 45,40 45,25 C45,10 25,10 25,25 M75,25 C75,40 55,40 55,25 C55,10 75,10 75,25 C75,40 95,40 95,25 C95,10 75,10 75,25"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="infinity-path"
                />
            </svg>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Loading history...</p>
        </div>
    );
};

export default InfinityLoader;
