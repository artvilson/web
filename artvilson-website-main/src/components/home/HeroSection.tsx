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
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="mb-6 space-y-2"
            variants={titleVariants}
          >
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">
              <div style={{
                background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Get Your Marketing Department Ready in 48 Hours</div>
              <div className="text-[#161616]">Skip the hiring headaches. Get a proven team that specializes in growing E‑commerce & Beauty businesses in the UAE & USA markets.</div>
            </div>
          </motion.div>
        </div>

        {/* Business Benefits Mini Blocks - Full width container */}
        <motion.div 
          className="max-w-6xl mx-auto mb-12"
          variants={ctaGroupVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} p-5 rounded-xl text-center border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition duration-300 ease-[cubic-bezier(0.42,0,0.58,1)]`}
              whileHover={{ scale: 1.015 }}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Instant Response</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No waiting. No missed leads. Every call answered in real-time
              </p>
            </motion.div>

            <motion.div 
              className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} p-5 rounded-xl text-center border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition duration-300 ease-[cubic-bezier(0.42,0,0.58,1)]`}
              whileHover={{ scale: 1.015 }}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Revenue Insights</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track buyer behavior, spot drop-offs, boost conversion
              </p>
            </motion.div>

            <motion.div 
              className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} p-5 rounded-xl text-center border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition duration-300 ease-[cubic-bezier(0.42,0,0.58,1)]`}
              whileHover={{ scale: 1.015 }}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Managed Setup</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We handle the integration — zero effort on your side
              </p>
            </motion.div>

            <motion.div 
              className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} p-5 rounded-xl text-center border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition duration-300 ease-[cubic-bezier(0.42,0,0.58,1)]`}
              whileHover={{ scale: 1.015 }}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Human-Like Voice</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Customers talk to AI that sounds natural, helpful, and real
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center">
          {/* CTA Button */}
          <motion.div 
            className="flex flex-col items-center gap-2"
            variants={ctaGroupVariants}
          >
            <motion.button 
              onClick={() => handleScroll('process-steps')}
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative z-10 px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-500/10 shadow-xl">
                <span 
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textFillColor: 'transparent',
                    display: 'inline-block',
                    width: 'fit-content'
                  }}
                >
                  Get Your Free Marketing Audit & 90-Day Roadmap
                </span>
              </div>
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