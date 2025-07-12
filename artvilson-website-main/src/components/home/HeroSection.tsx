import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  isDarkMode: boolean;
  handleScroll: (id: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isDarkMode, handleScroll }) => {
  // Container animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.2
      }
    }
  };

  // Text animation variants
  const titleVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      filter: 'blur(10px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Subtitle animation variants
  const subtitleVariants = {
    hidden: { 
      opacity: 0,
      y: 15,
      filter: 'blur(5px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // CTA group animation variants
  const ctaGroupVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.6
      }
    }
  };

  return (
    <div className="w-full bg-[#f5f5f7]">
      <motion.section 
        className="container mx-auto px-4 flex flex-col justify-center"
        style={{ minHeight: "calc(100vh - 200px)" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div 
            className="mb-6 space-y-2"
            variants={titleVariants}
          >
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">
              <div className="text-[#161616]">Get Your Marketing Department Ready in 48 Hours</div>
              <div style={{
                background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Skip the hiring headaches.</div>
            </div>
            
            <motion.div 
              className="mt-6 space-y-2"
              variants={subtitleVariants}
            >
              <div className="text-sm text-gray-600">
                Get a proven European team that specializes in growing E‑commerce & Beauty businesses in the UAE & USA markets.
              </div>
            </motion.div>
          </motion.div>
          
          {/* CTA Button */}
          <motion.div 
            className="flex flex-col items-center gap-2"
            variants={ctaGroupVariants}
          >
            <motion.button 
              onClick={() => handleScroll('process-steps')}
              className="bg-transparent text-black border-[1.5px] border-[#1D1D1F] rounded-[999px] px-6 py-2 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{
                background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>How We Build It</span>
            </motion.button>
            <div className="space-y-1">
              <p className="text-black text-base font-medium">
                No long-term contracts required
              </p>
              <p className="text-black text-base font-medium">
                First results guaranteed within 30 days
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HeroSection;