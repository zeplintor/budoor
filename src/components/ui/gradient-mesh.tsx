import React from 'react';

interface GradientMeshProps {
  className?: string;
  colors?: {
    top?: 'pink' | 'yellow' | 'mint' | 'purple' | 'coral';
    middle?: 'pink' | 'yellow' | 'mint' | 'purple' | 'coral';
    bottom?: 'pink' | 'yellow' | 'mint' | 'purple' | 'coral';
  };
}

export const GradientMesh: React.FC<GradientMeshProps> = ({
  className = '',
  colors = { top: 'pink', middle: 'yellow', bottom: 'mint' },
}) => {
  const getColor = (color: string) => `var(--accent-${color})`;

  return (
    <div
      className={`absolute inset-0 gradient-mesh ${className}`}
      style={{
        background: `
          radial-gradient(at 20% 30%, ${getColor(colors.top!)} 0px, transparent 50%),
          radial-gradient(at 80% 50%, ${getColor(colors.middle!)} 0px, transparent 50%),
          radial-gradient(at 50% 80%, ${getColor(colors.bottom!)} 0px, transparent 50%)
        `,
        opacity: 0.15,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }}
    />
  );
};
