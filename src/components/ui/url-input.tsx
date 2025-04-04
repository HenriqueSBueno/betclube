
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface URLInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  showError?: boolean;
  errorMessage?: string;
}

export function URLInput({
  value,
  onChange,
  showError = false,
  errorMessage = "Por favor, digite uma URL válida",
  className,
  ...props
}: URLInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);

  // Update component state when external value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const validateUrl = (url: string): boolean => {
    // Basic URL validation using regex
    const urlPattern = /^(https?:\/\/|ftp:\/\/)([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    return urlPattern.test(url);
  };

  const formatUrl = (url: string): string => {
    let formattedUrl = url.trim();
    
    // If URL is empty, return empty string
    if (!formattedUrl) return "";
    
    // Add https:// if protocol is missing
    if (!formattedUrl.match(/^(https?:\/\/|ftp:\/\/)/i)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    // Add www. if subdomain is missing and it's an http/https URL
    if (formattedUrl.match(/^https?:\/\//i) && !formattedUrl.match(/^https?:\/\/www\./i)) {
      formattedUrl = formattedUrl.replace(/^(https?:\/\/)/i, "$1www.");
    }
    
    return formattedUrl;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);
  };

  const handleBlur = () => {
    if (!inputValue) {
      onChange("");
      return;
    }

    // Format URL when blurring the input
    const formattedUrl = formatUrl(inputValue);
    setInputValue(formattedUrl);
    
    // Validate after formatting
    const isValid = validateUrl(formattedUrl);
    if (!isValid && formattedUrl) {
      setError(errorMessage);
    } else {
      setError(null);
      onChange(formattedUrl);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "pr-10",
            (error || showError) && "border-destructive focus-visible:ring-destructive",
            className
          )}
          placeholder="exemplo.com"
          {...props}
        />
        <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-70" />
      </div>
      {(error || (showError && errorMessage)) && (
        <p className="mt-1 text-sm text-destructive">{error || errorMessage}</p>
      )}
    </div>
  );
}
