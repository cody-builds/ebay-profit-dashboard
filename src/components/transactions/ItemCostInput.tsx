'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit3, Check, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemCostInputProps {
  transactionId: string;
  currentCost?: number;
  onCostUpdate: (transactionId: string, newCost: number) => Promise<void>;
  className?: string;
}

export function ItemCostInput({ 
  transactionId, 
  currentCost, 
  onCostUpdate, 
  className 
}: ItemCostInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [costValue, setCostValue] = useState(currentCost?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setCostValue(currentCost?.toString() || '');
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCostValue(currentCost?.toString() || '');
    setError(null);
  };

  const handleSave = async () => {
    const numericValue = parseFloat(costValue);
    
    // Validation
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Please enter a valid cost (0 or greater)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCostUpdate(transactionId, numericValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cost');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={costValue}
              onChange={(e) => setCostValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="pl-8"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      <span className="text-sm">
        {currentCost !== undefined ? (
          <span className="font-medium">${currentCost.toFixed(2)}</span>
        ) : (
          <span className="text-gray-500 italic">No cost entered</span>
        )}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit item cost"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
}