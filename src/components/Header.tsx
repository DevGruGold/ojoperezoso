
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Button from './Button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  // Update scroll state for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Determine if we're on the camera page
  const isExercisePage = location.pathname === '/exercise';
  
  if (isExercisePage) {
    return null; // Don't show header on exercise page
  }
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
        isScrolled ? "glass" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
            <span className="block w-5 h-5 rounded-full bg-primary/80 animate-pulse-subtle" />
          </span>
          <span className="font-semibold text-xl">Ojo Perezoso</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" current={location.pathname === '/'}>Inicio</NavLink>
          <NavLink to="/about" current={location.pathname === '/about'}>Acerca de</NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/exercise">
            <Button>Comenzar ejercicio</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  current: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, current, children }: NavLinkProps) => (
  <Link 
    to={to} 
    className={cn(
      "relative py-2 text-foreground/80 hover:text-foreground transition-colors",
      current && "text-primary font-medium"
    )}
  >
    {children}
    {current && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in" />
    )}
  </Link>
);

export default Header;
