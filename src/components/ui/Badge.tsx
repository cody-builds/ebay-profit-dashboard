import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          
          // Variants
          {
            'border-transparent bg-blue-600 text-white': variant === 'default',
            'border-transparent bg-gray-100 text-gray-900': variant === 'secondary',
            'border-transparent bg-red-600 text-white': variant === 'destructive',
            'border-gray-300 text-gray-900': variant === 'outline',
            'border-transparent bg-green-100 text-green-800': variant === 'success',
            'border-transparent bg-yellow-100 text-yellow-800': variant === 'warning',
            'border-transparent bg-red-100 text-red-800': variant === 'error',
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, type BadgeProps };