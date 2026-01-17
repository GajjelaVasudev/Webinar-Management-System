import * as React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClass: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-primary text-white shadow-glow hover:brightness-[1.06] active:brightness-[0.98]',
  secondary:
    'bg-white/10 text-white hover:bg-white/15 ring-soft shadow-soft',
  ghost: 'bg-transparent text-white/90 hover:bg-white/10',
  outline:
    'bg-transparent text-white ring-1 ring-white/15 hover:bg-white/10',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-7 text-base',
};

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}
