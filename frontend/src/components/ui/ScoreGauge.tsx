import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  level,
  size = 'md',
  showLabel = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const sizeMap = {
    sm: { dimension: 56, stroke: 5, fontSize: 'text-sm', labelSize: 'text-[9px]' },
    md: { dimension: 88, stroke: 7, fontSize: 'text-xl', labelSize: 'text-[11px]' },
    lg: { dimension: 128, stroke: 9, fontSize: 'text-3xl', labelSize: 'text-xs' },
  };

  const { dimension, stroke, fontSize, labelSize } = sizeMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#7D8792'; // Muted
  let glowColor = 'rgba(125, 135, 146, 0.2)';
  let textColor = 'text-muted';

  if (clampedScore >= 81) {
    strokeColor = '#FF4D67'; // Critical
    glowColor = 'rgba(255, 77, 103, 0.4)';
    textColor = 'text-critical';
  } else if (clampedScore >= 61) {
    strokeColor = '#FFC857'; // High
    glowColor = 'rgba(255, 200, 87, 0.3)';
    textColor = 'text-warning';
  } else if (clampedScore >= 31) {
    strokeColor = '#55B8FF'; // Medium
    glowColor = 'rgba(85, 184, 255, 0.3)';
    textColor = 'text-info';
  }

  const computedLevel = level || (
    clampedScore <= 30 ? 'LOW' :
    clampedScore <= 60 ? 'MEDIUM' :
    clampedScore <= 80 ? 'HIGH' : 'CRITICAL'
  );

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
        style={{ filter: `drop-shadow(0px 0px 8px ${glowColor})` }}
      >
        {/* Background track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Animated Progress Arc */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      {/* Centered score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-display font-bold ${fontSize} ${textColor} leading-none`}>
          {clampedScore}
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] text-muted font-mono mt-0.5">/100</span>
        )}
      </div>
      {showLabel && size !== 'sm' && (
        <span className={`mt-2 font-display font-bold uppercase tracking-wider ${labelSize} ${textColor}`}>
          {computedLevel}
        </span>
      )}
    </div>
  );
};
