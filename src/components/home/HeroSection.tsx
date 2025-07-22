@@ .. @@
           <motion.button 
             onClick={() => handleScroll('process-steps')}
-            className="relative inline-block"
+            className="relative inline-block bg-white/90 backdrop-blur-sm border border-gray-500/10 shadow-xl px-8 py-4 rounded-2xl"
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             transition={{ duration: 0.2 }}
           >
-            <div className="relative z-10 px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-500/10 shadow-xl">
-              <span 
-                className="text-2xl font-bold"
-                style={{
-                  background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
-                  WebkitBackgroundClip: 'text',
-                  backgroundClip: 'text',
-                  WebkitTextFillColor: 'transparent',
-                  textFillColor: 'transparent',
-                  display: 'inline-block',
-                  width: 'fit-content'
-                }}
-              >
-                Get Your Free Marketing Audit & 90-Day Roadmap
-              </span>
-            </div>
+            <span 
+              className="text-2xl font-bold"
+              style={{
+                background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 50%, #9333EA 100%)',
+                WebkitBackgroundClip: 'text',
+                backgroundClip: 'text',
+                WebkitTextFillColor: 'transparent',
+                textFillColor: 'transparent',
+                display: 'inline-block',
+                width: 'fit-content'
+              }}
+            >
+              Get Your Free Marketing Audit & 90-Day Roadmap
+            </span>
           </motion.button>