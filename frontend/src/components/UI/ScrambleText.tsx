import React, { useEffect, useState, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  className?: string;
  characterSet?: string;
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  duration = 800,
  className = '',
  characterSet = DEFAULT_CHARS
}) => {
  const [displayText, setDisplayText] = useState('');
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      let scrambled = '';
      for (let i = 0; i < text.length; i++) {
        const charProgressLimit = i / text.length;
        
        if (progress >= 1 || progress > charProgressLimit + (1 - charProgressLimit) * 0.8) {
          scrambled += text[i];
        } else {
          if (text[i] === ' ') {
            scrambled += ' ';
          } else {
            scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
          }
        }
      }
      
      setDisplayText(scrambled);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, duration, characterSet]);

  return (
    <span className={`inline-block font-mono ${className}`}>
      {displayText}
    </span>
  );
};

export default ScrambleText;
