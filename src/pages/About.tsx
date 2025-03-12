
import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

const About = () => {
  const sectionsRef = useRef<HTMLDivElement>(null);
  
  // Animate sections on scroll
  useEffect(() => {
    if (!sectionsRef.current) return;
    
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
    
    const sections = sectionsRef.current.querySelectorAll('.animate-section');
    sections.forEach((section) => observer.observe(section));
    
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col" ref={sectionsRef}>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
            <Eye className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Sobre la aplicación</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">
            Qué es Ojo Perezoso y cómo funciona
          </h1>
          
          <p className="text-lg text-foreground/80 mb-8 animate-slide-up">
            Una solución innovadora basada en evidencia científica para corregir la ambliopía
            (ojo perezoso) mediante ejercicios visuales asistidos por inteligencia artificial.
          </p>
        </div>
      </section>
      
      {/* What is Lazy Eye */}
      <section className="py-16 px-6 bg-secondary/50 animate-section opacity-0 translate-y-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">¿Qué es el ojo perezoso?</h2>
              
              <p className="mb-4">
                La ambliopía, comúnmente conocida como "ojo perezoso", es una condición ocular que
                afecta aproximadamente al 3% de la población mundial. Se desarrolla durante la infancia
                cuando el cerebro y un ojo no trabajan juntos correctamente.
              </p>
              
              <p className="mb-4">
                En esta condición, el cerebro favorece a un ojo sobre el otro, lo que puede provocar
                problemas de visión en el ojo menos utilizado. Con el tiempo, el ojo "perezoso"
                puede desarrollar una visión reducida si no se trata adecuadamente.
              </p>
              
              <p>
                Aunque la ambliopía se diagnostica principalmente en la infancia, estudios recientes
                muestran que el cerebro adulto conserva la plasticidad necesaria para mejorar la
                función visual a través de ejercicios específicos.
              </p>
            </div>
            
            <div className="md:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-white p-6 shadow-sm">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                
                <div className="h-full flex flex-col items-center justify-center">
                  <h3 className="text-xl font-medium mb-4">Síntomas comunes</h3>
                  
                  <ul className="space-y-3 text-left">
                    {[
                      'Visión borrosa o reducida',
                      'Problemas de percepción de profundidad',
                      'Mala coordinación ojo-mano',
                      'Ojos que no parecen trabajar juntos',
                      'Inclinación de la cabeza o cerrar un ojo',
                      'Fatiga visual y dolores de cabeza'
                    ].map((symptom, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How the App Works */}
      <section className="py-16 px-6 animate-section opacity-0 translate-y-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Cómo funciona Ojo Perezoso
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="font-semibold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-foreground/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Scientific Background */}
      <section className="py-16 px-6 bg-secondary/50 animate-section opacity-0 translate-y-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Fundamento científico</h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="mb-4">
              Ojo Perezoso se basa en estudios científicos recientes que demuestran la eficacia de
              los ejercicios visuales para la ambliopía. La investigación muestra que el entrenamiento
              visual puede mejorar la agudeza visual, la sensibilidad al contraste y la función binocular.
            </p>
            
            <p className="mb-4">
              El cerebro humano mantiene una neuroplasticidad significativa incluso en la edad adulta,
              lo que permite que las conexiones neuronales responsables de la visión se reorganicen y
              fortalezcan con el entrenamiento adecuado.
            </p>
            
            <p className="mb-6">
              Nuestros ejercicios están diseñados para:
            </p>
            
            <ul className="space-y-2 mb-8">
              {[
                'Estimular el uso del ojo afectado',
                'Mejorar la coordinación entre ambos ojos',
                'Fortalecer los músculos oculares',
                'Entrenar el cerebro para procesar correctamente las señales de ambos ojos'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-foreground/80 italic">
                <strong>Nota:</strong> Aunque Ojo Perezoso puede ser una herramienta efectiva para complementar
                el tratamiento de la ambliopía, siempre recomendamos consultar con un oftalmólogo u optometrista
                para un diagnóstico y tratamiento profesional.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recommended Usage */}
      <section className="py-16 px-6 animate-section opacity-0 translate-y-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Uso recomendado</h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="mb-6">
              Para obtener los mejores resultados con Ojo Perezoso, recomendamos seguir estas pautas:
            </p>
            
            <ul className="space-y-4 mb-8">
              {recommendedUsage.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-foreground/80">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-foreground/80">
                <strong>Importante:</strong> La consistencia es clave para el éxito. Los resultados pueden
                variar según la gravedad de la ambliopía y la edad del usuario, pero la mayoría de las
                personas comienzan a notar mejoras después de 4-6 semanas de uso regular.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-8 px-6 bg-secondary/50">
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

// Content data
const howItWorks = [
  {
    title: 'Detección precisa',
    description: 'La aplicación utiliza la cámara frontal para rastrear tus ojos en tiempo real, monitoreando su movimiento y coordinación.'
  },
  {
    title: 'Ejercicios guiados',
    description: 'Sigue objetivos visuales específicos diseñados para fortalecer el ojo más débil y mejorar la coordinación binocular.'
  },
  {
    title: 'Seguimiento de progreso',
    description: 'La aplicación monitorea y registra tu progreso, ajustando la dificultad de los ejercicios para optimizar los resultados.'
  }
];

const recommendedUsage = [
  {
    title: 'Sesiones diarias',
    description: 'Realiza ejercicios durante 5-10 minutos, al menos una vez al día.'
  },
  {
    title: 'Ambiente adecuado',
    description: 'Utiliza la aplicación en un espacio bien iluminado, sin distracciones.'
  },
  {
    title: 'Posición correcta',
    description: 'Mantén una distancia cómoda de la pantalla (aproximadamente 40-50 cm).'
  },
  {
    title: 'Progresión gradual',
    description: 'Comienza con sesiones cortas y aumenta gradualmente la duración conforme te sientas más cómodo.'
  },
  {
    title: 'Descansos necesarios',
    description: 'Si experimentas fatiga visual, toma un descanso. La sobreexigencia puede ser contraproducente.'
  }
];

export default About;
