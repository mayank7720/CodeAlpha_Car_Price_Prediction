import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glass-card hover-lift p-6 rounded-xl ${className}`}>
      {children}
    </div>
  );
}
