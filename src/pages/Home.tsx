@@ .. @@
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.8 }}
     >
       {/* Hero Section */}
-      <HeroSection isDarkMode={isDarkMode} handleScroll={handleScroll} />
+      <div id="hero">
+        <HeroSection isDarkMode={isDarkMode} handleScroll={handleScroll} />
+      </div>
       
       {/* Integration Partners Marquee */}
       <IntegrationMarquee isDarkMode={isDarkMode} />
   )