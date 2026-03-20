import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

interface ConditionalRevealProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ConditionalReveal({ show, children, className }: ConditionalRevealProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div
            className={`border-l-4 border-[#0EA5E9] bg-[#EFF6FF] rounded-r-lg p-4 ml-2 ${className ?? ''}`}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
