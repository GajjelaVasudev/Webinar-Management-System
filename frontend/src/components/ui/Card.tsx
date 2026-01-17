import * as React from 'react';
import { cn } from '../../lib/cn';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof JSX.IntrinsicElements;
};

export default function Card({ as, className, ...props }: Props) {
  const Tag = (as ?? 'div') as any;
  return (
    <Tag
      className={cn(
        'glass ring-soft rounded-3xl shadow-soft',
        'transition duration-300 hover:shadow-glow',
        className
      )}
      {...props}
    />
  );
}
