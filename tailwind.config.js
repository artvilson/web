@@ .. @@
       },
       animation: {
         'fade-in': 'fade-in 0.3s cubic-bezier(0.42, 0, 0.58, 1)',
         'scale-in': 'scale-in 0.3s cubic-bezier(0.42, 0, 0.58, 1)',
         'slide-in': 'slide-in 0.3s cubic-bezier(0.42, 0, 0.58, 1)',
+        'spin': 'spin 1s linear infinite',
       },
       keyframes: {
         'fade-in': {
@@ .. @@
           '0%': { transform: 'translateY(10px)', opacity: '0' },
           '100%': { transform: 'translateY(0)', opacity: '1' },
         },
+        'spin': {
+          '0%': { transform: 'rotate(0deg)' },
+          '100%': { transform: 'rotate(360deg)' },
+        },
       },
     },
   },