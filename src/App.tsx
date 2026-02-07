import * as React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useWebVitals } from '@/lib/performance-utils';
import { Toaster } from 'sonner';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useLenis } from '@/lib/lenis-utils';

// Layout components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/layout/PageLoader';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const Analyzer = React.lazy(() => import('./pages/Analyzer'));

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const location = useLocation();

  // Check if we're on the analyzer page (skip marketing layout)
  const isAnalyzerPage = location.pathname.startsWith('/analyzer');

  // Initialize Lenis
  const lenis = useLenis();

  // Add console logging for debugging
  console.log('App component rendering, isLoaded:', isLoaded);

  // Track web vitals
  useWebVitals((metric) => {
    console.log('Web Vital:', metric);
  });

  // Set loaded state for animations
  React.useEffect(() => {
    console.log('Setting isLoaded to true');
    setIsLoaded(true);
  }, []);

  // Handle scroll function using Lenis
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (!element || !lenis) return;

    const headerHeight = 72; // Fixed header height
    const offset = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    lenis.scrollTo(offset, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  };

  // Render analyzer page without marketing layout
  if (isAnalyzerPage) {
    return (
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/analyzer" element={<Analyzer />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </React.Suspense>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className={`min-h-screen font-sans transition-colors duration-500 relative overflow-hidden ${
        isDarkMode
          ? 'mesh-gradient-dark text-white'
          : 'mesh-gradient-light text-[#1a1a1a]'
      }`}>
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          handleScroll={handleScroll}
        />

        {/* Main Content */}
        <main className={`relative z-10 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} pt-[72px]`}>
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home isDarkMode={isDarkMode} handleScroll={handleScroll} />} />
            </Routes>
          </React.Suspense>
        </main>

        {/* Footer */}
        <Footer isDarkMode={isDarkMode} />

        {/* Toast container */}
        <Toaster position="top-right" richColors closeButton />
      </div>
    </LazyMotion>
  );
}

export default App;