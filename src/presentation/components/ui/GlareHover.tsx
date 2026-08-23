"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import styles from "./GlareHover.module.css";

interface GlareHoverProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
}

type GlareStyle = CSSProperties & {
  "--glare-color": string;
  "--glare-opacity": number;
  "--glare-angle": string;
  "--glare-size": string;
  "--glare-duration": string;
};

export default function GlareHover({
  children,
  className = "",
  glareColor = "#ffffff",
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
}: GlareHoverProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const hasPlayed = useRef(false);

  const playGlare = () => {
    if (playOnce && hasPlayed.current) return;
    hasPlayed.current = true;
    setAnimationKey((value) => value + 1);
  };

  const glareStyle: GlareStyle = {
    "--glare-color": glareColor,
    "--glare-opacity": glareOpacity,
    "--glare-angle": `${glareAngle}deg`,
    "--glare-size": `${glareSize}px`,
    "--glare-duration": `${transitionDuration}ms`,
  };

  return (
    <div className={`${styles.root} ${className}`} onPointerEnter={playGlare}>
      {children}
      {animationKey > 0 && <span key={animationKey} className={styles.glare} style={glareStyle} aria-hidden="true" />}
    </div>
  );
}
