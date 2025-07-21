// vibe-source: https://app.base44.com/api/apps/687c574f2fee44ff01919f93/entities/Component/687d82c8169a516a59fc27d0
// component: ComponentHub Logo button
// category: buttons

import React from 'react';

const CliButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-teal-300 rounded-xl hover:bg-zinc-800 transition-all border border-zinc-700 shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        className="text-teal-300"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#1e1e1e" />
        <polyline
          points="8 9 11 12 8 15"
          fill="none"
          stroke="#6EE7B7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="13"
          y1="15"
          x2="17"
          y2="15"
          stroke="#6EE7B7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-medium tracking-wide">Launch CLI</span>
    </button>
  );
};

export default CliButton;
