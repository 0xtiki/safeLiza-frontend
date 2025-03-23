import { useState } from 'react';

type AddressCopyProps = {
  value: string;
  label: string;
};

export default function AddressCopy({ value, label }: AddressCopyProps) {
  const [copied, setCopied] = useState(false);
  
  // Abbreviate the address: first 5 chars + ... + last 5 chars
  const abbreviate = (str: string) => {
    if (!str || str.length <= 12) return str;
    return `${str.substring(0, 5)}...${str.substring(str.length - 5)}`;
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center mb-2">
      <span className="font-bold mr-2">{label}:</span>
      <span className="mr-2">{abbreviate(value)}</span>
      <button 
        onClick={handleCopy} 
        className="btn btn-xs btn-ghost"
        title={`Copy full ${label}`}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        )}
      </button>
    </div>
  );
} 