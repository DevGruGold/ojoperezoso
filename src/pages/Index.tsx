
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CameraView from '@/components/CameraView';
import SlothAssistant from '@/components/SlothAssistant';
import ExerciseControls from '@/components/ExerciseControls';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [showExercise, setShowExercise] = useState(false);
  const [slothMessage, setSlothMessage] = useState('');
  
  // Update sloth message based on exercise state
  useEffect(() => {
    if (showExercise) {
      setSlothMessage(t('exercise.sloth.welcome'));
    } else {
      setSlothMessage(t('index.hero.description'));
    }
  }, [showExercise, t]);
  
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

  const handleStartExercise = () => {
    setShowExercise(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseExercise = () => {
    setShowExercise(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with integrated exercise */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {!showExercise ? (
            <>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{t('index.hero.tagline')}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
                {t('index.hero.title')}
              </h1>
              
              <div className="mb-10">
                <SlothAssistant 
                  message={slothMessage}
                  interactive={true}
                  onInteraction={handleStartExercise}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                <Button size="lg" onClick={handleStartExercise}>
                  {t('index.hero.startButton')}
                </Button>
                <Link to="/about">
                  <Button variant="secondary" size="lg">
                    {t('index.hero.learnMore')}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <SlothAssistant 
                  message={slothMessage}
                  interactive={true}
                />
              </div>
              
              <div className="mb-4">
                <CameraView />
              </div>
              
              <ExerciseControls onClose={handleCloseExercise} />
            </div>
          )}
        </div>
      </section>
      
      {/* Only show the rest of the content when not in exercise mode */}
      {!showExercise && (
        <>
          {/* App Screenshot/Preview */}
          <section className="py-16 px-6 bg-secondary/50">
            <div className="max-w-6xl mx-auto">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto animate-scale-up">
                <div className="relative aspect-[16/9] max-h-[600px] overflow-hidden">
                  {/* Camera preview simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/80 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="w-20 h-20 mx-auto mb-4 text-primary/80" />
                      <p className="text-white/60 text-lg">{t('index.preview.cameraPreview')}</p>
                    </div>
                  </div>
                  
                  {/* Overlay UI elements */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="glass px-8 py-6 rounded-xl max-w-md">
                      <h3 className="text-lg font-medium mb-4">{t('index.preview.exerciseInProgress')}</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Eye className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">{t('index.preview.eyesDetected')}</p>
                            <p className="text-foreground/60 text-xs">{t('index.preview.followPrompt')}</p>
                          </div>
                        </div>
                        
                        <Button size="sm">{t('index.preview.pauseButton')}</Button>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.features.title')}</h2>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                  {t('index.features.subtitle')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                  index={0}
                  title={t('index.features.eyeDetection.title')}
                  description={t('index.features.eyeDetection.description')}
                  icon={<Eye className="w-6 h-6 text-primary" />}
                  iconBgColor="bg-primary/10"
                />
                <FeatureCard 
                  index={1}
                  title={t('index.features.customExercises.title')}
                  description={t('index.features.customExercises.description')}
                  icon={<Eye className="w-6 h-6 text-primary" />}
                  iconBgColor="bg-primary/10"
                />
                <FeatureCard 
                  index={2}
                  title={t('index.features.progressTracking.title')}
                  description={t('index.features.progressTracking.description')}
                  icon={<Eye className="w-6 h-6 text-primary" />}
                  iconBgColor="bg-primary/10"
                />
              </div>
            </div>
          </section>
          
          {/* Testimonial */}
          <section className="py-20 px-6 bg-primary/5">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-fade-in">
                <p className="text-xl md:text-2xl font-medium italic mb-8">
                  "{t('index.testimonial.quote')}"
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                  <div className="ml-4 text-left">
                    <p className="font-semibold">{t('index.testimonial.name')}</p>
                    <p className="text-sm text-foreground/70">{t('index.testimonial.title')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* CTA */}
          <section className="py-20 px-6 bg-white">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-slide-up">
                {t('index.cta.title')}
              </h2>
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-10 animate-slide-up">
                {t('index.cta.description')}
              </p>
              <div className="animate-slide-up">
                <Button size="lg" onClick={handleStartExercise}>
                  {t('index.cta.button')}
                </Button>
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
                © {new Date().getFullYear()} Ojo Perezoso. {t('index.footer.rights')}
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

// Separate feature card component to improve readability
interface FeatureCardProps {
  index: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const FeatureCard = ({ index, title, description, icon, iconBgColor }: FeatureCardProps) => (
  <div 
    className="feature-card opacity-0 translate-y-10 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
      iconBgColor
    )}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-foreground/80">{description}</p>
  </div>
);

export default Index;
