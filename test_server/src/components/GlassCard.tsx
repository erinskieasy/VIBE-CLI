// vibe-source: https://app.base44.com/api/apps/687c574f2fee44ff01919f93/entities/Component/687c585c5d22a0995830bc82
// component: GlassCard
// category: cards

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GlassCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ title, children, className = '' }: GlassCardProps) {
  return (
    <Card className={`bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
      {title && (
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="text-white/90">
        {children}
      </CardContent>
    </Card>
  );
}