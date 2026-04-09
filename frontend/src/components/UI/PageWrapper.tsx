import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.25,
};

/**
 * Wraps page content with Framer Motion fade+slide animation.
 * Use inside page components for consistent enter/exit transitions.
 */
const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageWrapper;
