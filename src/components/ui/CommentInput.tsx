"use client";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface CommentInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  maxLength?: number;
  placeholder?: string;
}

export function CommentInput({
  value = "",
  onChange,
  maxLength = 140,
  placeholder = "感想を入力...",
}: CommentInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setLocalValue(newValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onChange(localValue.trim() || undefined);
  };

  const remaining = maxLength - localValue.length;
  const isNearLimit = remaining <= 20;

  return (
    <div className="w-full">
      <div className="relative">
        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-foreground-secondary" />
        <textarea
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-lg bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {(isFocused || localValue.length > 0) && (
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-foreground-secondary">
            {localValue.length > 0 ? `${localValue.length}文字` : ""}
          </span>
          <span
            className={`${
              isNearLimit ? "text-error" : "text-foreground-secondary"
            }`}
          >
            残り{remaining}文字
          </span>
        </div>
      )}
    </div>
  );
}
