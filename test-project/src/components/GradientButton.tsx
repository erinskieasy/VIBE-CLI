// vibe-source: https://app.base44.com/api/apps/687c574f2fee44ff01919f93/entities/Component/687c585c5d22a0995830bc81
// component: GradientButton
// category: buttons

import React from 'react';
import { Button } from '@/components/ui/button';

interface GradientButtonProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'pink';
  onClick?: () => void;
}

export default function GradientButton({ 
  children, 
  variant = 'blue', 
  onClick 
}: GradientButtonProps) {
  const variants = {
    blue: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
    pink: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500'
  };

  return (
    <Button
      className={`${variants[variant]} text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}