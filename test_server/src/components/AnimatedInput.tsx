// vibe-source: https://app.base44.com/api/apps/687c574f2fee44ff01919f93/entities/Component/687c585c5d22a0995830bc83
// component: AnimatedInput
// category: inputs

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnimatedInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AnimatedInput({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange 
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative">
      <Input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ''}
        className="peer pt-6 pb-2 bg-transparent border-2 border-gray-300 focus:border-blue-500 transition-all duration-200"
      />
      <Label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-2 text-xs text-blue-500' 
          : 'top-1/2 -translate-y-1/2 text-gray-500'
      }`}>
        {label}
      </Label>
    </div>
  );
}