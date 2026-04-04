import { memo } from 'react';

interface BoltIconProps {
  name: string;
  className?: string;
}

export const BoltIcon = memo(({ name, className = '' }: BoltIconProps) => {
  const iconPath = `/icons/${name}.svg`;

  return (
    <div
      className={`inline-block bg-current ${className}`}
      style={{
        maskImage: `url(${iconPath})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskImage: `url(${iconPath})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
      }}
    />
  );
});

BoltIcon.displayName = 'BoltIcon';
