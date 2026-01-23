import React from 'react';

interface OrganicBlobProps {
  color: 'pink' | 'yellow' | 'mint' | 'purple' | 'coral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  opacity?: number;
}

const sizeMap = {
  sm: 'w-48 h-48',
  md: 'w-64 h-64',
  lg: 'w-96 h-96',
  xl: 'w-[32rem] h-[32rem]',
};

const colorMap = {
  pink: 'bg-[var(--accent-pink)]',
  yellow: 'bg-[var(--accent-yellow)]',
  mint: 'bg-[var(--accent-mint)]',
  purple: 'bg-[var(--accent-purple)]',
  coral: 'bg-[var(--accent-coral)]',
};

export const OrganicBlob: React.FC<OrganicBlobProps> = ({
  color,
  size = 'md',
  className = '',
  animated = true,
  opacity = 0.2,
}) => {
  return (
    <div
      className={`blob ${colorMap[color]} ${sizeMap[size]} ${
        animated ? 'animate-blob' : ''
      } ${className}`}
      style={{ opacity }}
    />
  );
};
