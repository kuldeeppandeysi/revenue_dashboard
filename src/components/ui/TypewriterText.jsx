import React, { useState, useEffect } from 'react';

export default function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 30,
  className = "" 
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started || currentIndex >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayText(text.substring(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, started, speed]);

  return (
    <span className={className}>
      {displayText}
      {started && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}