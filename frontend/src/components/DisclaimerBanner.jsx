import React, { useState } from 'react';
import { AlertTriangle, X, Clock, Mail } from 'lucide-react';

const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-amber-900/40 border-b border-amber-500/30">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex items-start sm:items-center justify-between py-3 sm:py-4 gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base text-amber-200 font-medium">
                <span className="hidden sm:inline">📌 </span>
                Items older than 2 weeks are automatically archived
              </p>
              <p className="text-xs sm:text-sm text-amber-300/80 mt-0.5">
                If your lost item is older than 2 weeks, please{' '}
                <a 
                  href="mailto:lostandfound@university.edu" 
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  contact the team
                </a>
                {' '}to search archived records.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-400 hover:text-amber-300"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBanner;

