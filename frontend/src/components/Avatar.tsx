import React from 'react';

interface AvatarProps {
  username: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// List of soft, pleasant colors for avatars
const AVATAR_COLORS = [
  'bg-red-400',
  'bg-cyan-400',
  'bg-blue-400',
  'bg-orange-400',
  'bg-teal-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-blue-300',
  'bg-amber-500',
  'bg-teal-600',
];

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

const Avatar: React.FC<AvatarProps> = ({ 
  username, 
  imageUrl, 
  size = 'md',
  className = '' 
}) => {
  // Get a consistent color based on username
  const colorIndex = username.charCodeAt(0) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];
  
  // Get first letter
  const firstLetter = username.charAt(0).toUpperCase();
  
  // Size classes
  const sizeClasses = sizeMap[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={username}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
        title={username}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${bgColor} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      title={username}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
