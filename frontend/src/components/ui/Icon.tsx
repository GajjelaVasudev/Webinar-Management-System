import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function IconSparkle(props: Props) {
  const { title = 'Sparkle', ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <title>{title}</title>
      <path
        d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8l-1.2-4.2L6.6 7.4l4.2-1.2L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19 12l.8 2.8 2.7.8-2.7.8L19 19l-.8-2.6-2.7-.8 2.7-.8L19 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 13l.7 2.4 2.3.7-2.3.7L5 19l-.7-2.2-2.3-.7 2.3-.7L5 13z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function IconPlay(props: Props) {
  const { title = 'Play', ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <title>{title}</title>
      <path
        d="M10 8.5v7l6-3.5-6-3.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function IconSocialX(props: Props) {
  const { title = 'X', ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <title>{title}</title>
      <path
        d="M18.7 3H21l-5.7 6.5L22 21h-5.2l-4.1-5.6L7.6 21H5.3l6.1-7L2 3h5.3l3.7 5 4.4-5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconSocialIn(props: Props) {
  const { title = 'LinkedIn', ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <title>{title}</title>
      <path
        d="M6.8 6.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z"
        fill="currentColor"
      />
      <path
        d="M5 21V8.1h3.6V21H5z"
        fill="currentColor"
      />
      <path
        d="M12.1 8.1V9.9c.5-.9 1.8-2.1 4-2.1 4.3 0 5.1 2.8 5.1 6.5V21h-3.6v-6c0-1.4 0-3.3-2-3.3s-2.3 1.5-2.3 3.2V21h-3.6V8.1h3.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconSocialFb(props: Props) {
  const { title = 'Facebook', ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <title>{title}</title>
      <path
        d="M13.6 21v-7h2.3l.4-2.7h-2.7V9.6c0-.8.2-1.3 1.4-1.3h1.5V5.9c-.7-.1-1.5-.2-2.4-.2-2.4 0-4 1.4-4 4v1.6H7.7V14H10v7h3.6z"
        fill="currentColor"
      />
    </svg>
  );
}
