import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    in: {
        opacity: 1,
        y: 0
    },
    out: {
        opacity: 0,
        y: -20
    }
};

const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.5
};

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={`relative overflow-hidden min-h-screen w-full ${className}`}
        >
            {/* Neon Video Background */}
            <div className="video-bg-container">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="video-bg"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-neon-glowing-lines-on-a-black-background-34305-large.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 w-full min-h-screen flex flex-col bg-black-overlay">
                {children}
            </div>
        </motion.div>
    );
};

export default PageTransition;
