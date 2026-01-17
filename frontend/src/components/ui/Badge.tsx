import * as React from 'react';
import { cn } from '../../lib/cn';

type Tone = 'hot' | 'cool' | 'neutral';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

const toneClass: Record<Tone, string> = {
  hot: 'bg-brand-hot/20 text-white ring-1 ring-brand-hot/35',
  cool: 'bg-brand-primary/20 text-white ring-1 ring-brand-primary/35',
  neutral: 'bg-white/10 text-white/90 ring-1 ring-white/15',
};

export default function Badge({ tone = 'neutral', className, ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        toneClass[tone],
        className
      )}
      {...props}
    />
  );
}
