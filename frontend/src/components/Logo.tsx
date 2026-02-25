interface LogoProps {
  className?: string;
  onClick?: () => void;
  theme?: 'gradient' | 'white';
}

export default function Logo({ className = '', onClick, theme = 'gradient' }: LogoProps) {
  const wordmarkMap = {
    gradient: '/logos/altrix-wordmark-gradient.svg',
    white: '/logos/altrix-wordmark-white.svg'
  };

  return (
    <img
      src={wordmarkMap[theme]}
      alt="Altrix"
      className={`h-8 w-auto hover:opacity-85 transition-opacity ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}
