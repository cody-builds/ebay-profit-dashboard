import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          
          // Variants
          {
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800': variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800': variant === 'destructive',
            'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100': variant === 'outline',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300': variant === 'secondary',
            'text-gray-900 hover:bg-gray-100 active:bg-gray-200': variant === 'ghost',
            'text-blue-600 underline-offset-4 hover:underline': variant === 'link',
            'bg-green-600 text-white hover:bg-green-700 active:bg-green-800': variant === 'success',
          },
          
          // Sizes
          {
            'h-10 py-2 px-4': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };