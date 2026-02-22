"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Transition, cubicBezier } from "framer-motion";
import { Typography } from "../ui/Typography";

export const WaveLoadingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Organic wave path for the vertical edge
  const wavePathLeft = "M100 0 C80 100, 120 200, 100 300 C80 400, 120 500, 100 600 V600 H0 V0 Z";
  const wavePathRight = "M0 0 C20 100, -20 200, 0 300 C20 400, -20 500, 0 600 V600 H100 V0 Z";

  const splitTransition: Transition = {
    duration: 1.8,
    ease: cubicBezier(0.77, 0, 0.175, 1),
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          exit={{ pointerEvents: "none" }}
        >
          {/* Left Panel */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[51%] bg-primary flex justify-end"
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={splitTransition}
          >
             <svg
              viewBox="0 0 100 600"
              preserveAspectRatio="none"
              className="h-full w-[15vw] translate-x-[99%] fill-primary"
            >
              <path d={wavePathLeft} />
            </svg>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-[51%] bg-primary flex justify-start"
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={splitTransition}
          >
            <svg
              viewBox="0 0 100 600"
              preserveAspectRatio="none"
              className="h-full w-[15vw] -translate-x-[99%] fill-primary"
            >
              <path d={wavePathRight} />
            </svg>
          </motion.div>

          {/* Center Logo */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.8, ease: "easeIn" } }}
            transition={{ duration: 1 }}
          >
            <Typography variant="h1" className="text-cta tracking-[0.2em] font-black">
              HMTKBA
            </Typography>
            <motion.div
              className="h-1 bg-cta mt-2 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
