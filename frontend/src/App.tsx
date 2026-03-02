import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedRoutes from './components/AnimatedRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />

          {/* Global "CODE RED" watermark — bottom-right on every page */}
          <div className="fixed bottom-3 right-4 z-[9999] pointer-events-none select-none">
            <span
              className="text-xs font-semibold tracking-widest text-red-500"
              style={{ textShadow: '0 0 8px rgba(239,68,68,0.9), 0 0 18px rgba(239,68,68,0.5)' }}
            >
              Made by the Team <span className="font-extrabold tracking-[0.2em] uppercase">CODE RED</span>
            </span>
          </div>

        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
