// src/components/CaribbeanBackground.jsx
import React, { useEffect, useState } from 'react';

const CaribbeanBackground = () => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Create confetti particles
    const createConfetti = () => {
      const particles = [];
      const colors = [
        'var(--tnt-red)',
        'var(--sunshine-yellow)',
        'var(--caribbean-blue)',
        'var(--lime-green)',
        'var(--carnival-pink)',
        'var(--sunset-orange)'
      ];
      
      for (let i = 0; i < 30; i++) {
        particles.push({
          id: i,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          duration: Math.random() * 6 + 4,
          delay: Math.random() * 5
        });
      }
      setConfetti(particles);
    };

    createConfetti();
  }, []);

  return (
    <>
      <div className="caribbean-pattern"></div>
      <div className="palm-trees"></div>
      <div className="sun"></div>
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="confetti"
          style={{
            left: `${particle.left}%`,
            background: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </>
  );
};

export default CaribbeanBackground;