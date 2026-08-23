"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ExpandableTextProps {
  text: string;
  className?: string;
}

export function ExpandableText({ text, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "5rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative overflow-hidden w-full"
      >
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed pb-2">
          {text}
        </p>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </motion.div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary font-bold hover:opacity-80 text-sm md:text-base transition-all"
      >
        {isExpanded ? "Sembunyikan" : "Selengkapnya"}
      </button>
    </div>
  );
}
