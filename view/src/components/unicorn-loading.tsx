import { useEffect } from "react";

interface UnicornLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

declare global {
  interface Window {
    UnicornStudio: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

export function UnicornLoading({ 
  message = "Carregando...", 
  fullScreen = true 
}: UnicornLoadingProps) {
  useEffect(() => {
    // Inject the Unicorn Studio script if not already loaded
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {} };
      
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
      script.onload = function() {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(script);
    }
  }, []);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden">
        {/* Unicorn animation container - much larger scale to fill screen */}
        <div className="relative w-full h-full">
          <div 
            data-us-project="KUI3YejM8LBSGTGFLTBL" 
            className="absolute inset-0"
            style={{ 
              width: "100vw", 
              height: "100vh",
              transform: "scale(1)", // Much larger scale to fill screen
              transformOrigin: "center"
            }}
          />
        </div>
        
        {/* Loading message overlay */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
            <p className="text-gray-700 text-base sm:text-lg font-medium animate-pulse">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Non-fullscreen version for inline usage
  return (
    <div className="relative w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
      <div 
        data-us-project="KUI3YejM8LBSGTGFLTBL" 
        className="absolute inset-0"
        style={{ 
          width: "100%", 
          height: "100%",
          transform: "scale(1)", // Much larger scale for inline usage
          transformOrigin: "center"
        }}
      />
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
          <p className="text-gray-700 text-sm font-medium animate-pulse">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
