"use client";
import { motion, useReducedMotion } from "motion/react";
import React from "react";

export function RevealStagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const childrenArray = React.Children.toArray(children);
  
  return (
    <ul className={className}>
      {childrenArray.map((child, i) => (
        <motion.li
          key={i}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.6,
            delay: i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="h-full"
        >
          {child}
        </motion.li>
      ))}
    </ul>
  );
}
