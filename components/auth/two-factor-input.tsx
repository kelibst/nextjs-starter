"use client";

/**
 * TwoFactorInput Component
 *
 * Specialized input for 6-digit TOTP codes
 * Features:
 * - 6 separate input boxes (better UX)
 * - Auto-focus next box on digit entry
 * - Auto-focus previous box on backspace
 * - Paste support (paste all 6 digits at once)
 * - Only allows numeric input
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TwoFactorInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function TwoFactorInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: TwoFactorInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (index: number, newValue: string) => {
    // Only allow single digit
    const digit = newValue.replace(/[^0-9]/g, "").slice(-1);

    // Update the value
    const newDigits = [...digits];
    newDigits[index] = digit || " ";
    const newCode = newDigits.join("").trim();
    onChange(newCode);

    // Auto-focus next input if digit was entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all 6 digits entered
    if (newCode.length === 6 && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Backspace: clear current and focus previous
    if (e.key === "Backspace") {
      if (!digits[index] || digits[index] === " ") {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    }

    // Arrow left: focus previous
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow right: focus next
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    if (pastedData) {
      onChange(pastedData);

      // Focus last filled input or first empty input
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();

      // Call onComplete if pasted 6 digits
      if (pastedData.length === 6 && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit === " " ? "" : digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold",
            error && "border-red-500 focus-visible:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
