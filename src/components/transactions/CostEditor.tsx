'use client';

import { useState, useRef, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { Check, X } from 'lucide-react';

interface CostEditorProps {
  transaction: Transaction;
  onSave: (newCost: number) => void;
  onCancel: () => void;
}

export function CostEditor({ transaction, onSave, onCancel }: CostEditorProps) {
  const [cost, setCost] = useState(transaction.itemCost?.toString() || '0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = async () => {
    const numericCost = parseFloat(cost);
    
    // Validation
    if (isNaN(numericCost) || numericCost < 0) {
      setError('Please enter a valid cost amount (0 or greater)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API call to update the cost
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemCost: numericCost,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cost');
      }

      onSave(numericCost);
    } catch (err) {
      console.error('Error updating cost:', err);
      setError('Failed to update cost. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, digits, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCost(value);
      setError('');
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={cost}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={`w-20 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error 
              ? 'border-red-300 focus:border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          } ${
            isLoading ? 'bg-gray-100 cursor-wait' : 'bg-white'
          }`}
          placeholder="0.00"
        />
        
        {/* Error tooltip */}
        {error && (
          <div className="absolute z-10 top-full left-0 mt-1 p-2 text-xs text-red-700 bg-red-100 border border-red-300 rounded shadow-lg whitespace-nowrap">
            {error}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save cost"
        >
          <Check className="h-3 w-3" />
        </button>
        
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}