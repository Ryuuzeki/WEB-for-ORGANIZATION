"use client";

import React from "react";
import { motion } from "framer-motion";

export const Waves: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        initial={{ y: 20 }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="#5990c0"
          fillOpacity="1"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </motion.svg>
    </div>
  );
};
