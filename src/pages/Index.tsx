
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Simple intersection observer to trigger animations
  useEffect(() => {
    if (!featuresRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const featureElements = featuresRef.current.querySelectorAll('.feature-card');
    featureElements.forEach((el) => observer.observe(el));
    
    return () => {
      featureElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
            <Eye className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Entrena tu visión con IA</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Corrige tu ojo perezoso con ejercicios guiados
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10 animate-slide-up">
            Ojo Perezoso utiliza inteligencia artificial para ayudarte a corregir la ambliopía
            mediante ejercicios personalizados que entrenan tu cerebro para mejorar la coordinación ocular.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/exercise">
              <Button size="lg">
                Comenzar ejercicio
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                Aprender más
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* App Screenshot/Preview */}
      <section className="py-16 px-6 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto animate-scale-up">
            <div className="relative aspect-[16/9] max-h-[600px] overflow-hidden">
              {/* Camera preview simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/80 flex items-center justify-center">
                <div className="text-white text-center">
                  <Eye className="w-20 h-20 mx-auto mb-4 text-primary/80" />
                  <p className="text-white/60 text-lg">Vista previa de la cámara</p>
                </div>
              </div>
              
              {/* Overlay UI elements */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <div className="glass px-8 py-6 rounded-xl max-w-md">
                  <h3 className="text-lg font-medium mb-4">Ejercicio en progreso</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Ojos detectados</p>
                        <p className="text-foreground/60 text-xs">Sigue el punto con ambos ojos</p>
                      </div>
                    </div>
                    
                    <Button size="sm">Pausar</Button>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Características principales</h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Diseñado con la precisión y atención al detalle que tu visión merece
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card opacity-0 translate-y-10 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  feature.iconBgColor
                )}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonial (Simplistic) */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <p className="text-xl md:text-2xl font-medium italic mb-8">
              "Después de usar Ojo Perezoso durante 8 semanas, he notado una mejora significativa en mi visión periférica y profundidad."
            </p>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full" />
              <div className="ml-4 text-left">
                <p className="font-semibold">María García</p>
                <p className="text-sm text-foreground/70">Paciente de ambliopía</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-slide-up">
            Empieza a corregir tu visión hoy
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-10 animate-slide-up">
            Dedica solo 10 minutos diarios para notar mejoras significativas en tu visión binocular
          </p>
          <div className="animate-slide-up">
            <Link to="/exercise">
              <Button size="lg">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 bg-secondary/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="block w-4 h-4 rounded-full bg-primary/80" />
            </span>
            <span className="font-semibold">Ojo Perezoso</span>
          </div>
          
          <div className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Ojo Perezoso. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature data
const features = [
  {
    title: 'Detección ocular con IA',
    description: 'Algoritmos precisos que rastrean tus ojos en tiempo real para proporcionar retroalimentación personalizada.',
    icon: <Eye className="w-6 h-6 text-primary" />,
    iconBgColor: 'bg-primary/10'
  },
  {
    title: 'Ejercicios personalizados',
    description: 'Rutinas diseñadas específicamente para fortalecer los músculos oculares y mejorar la coordinación cerebral.',
    icon: <Eye className="w-6 h-6 text-primary" />,
    iconBgColor: 'bg-primary/10'
  },
  {
    title: 'Seguimiento de progreso',
    description: 'Monitorea tu mejora a lo largo del tiempo con métricas detalladas y visualizaciones claras.',
    icon: <Eye className="w-6 h-6 text-primary" />,
    iconBgColor: 'bg-primary/10'
  }
];

export default Index;
