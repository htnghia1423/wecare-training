import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '60px',
  };

  const spinnerSize = sizeMap[size];

  const spinner = (
    <div className={`wecare-spinner wecare-spinner--${size}`}>
      <div
        className="wecare-spinner__circle"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      />
      {text && <p className="wecare-spinner__text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="wecare-spinner-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};
