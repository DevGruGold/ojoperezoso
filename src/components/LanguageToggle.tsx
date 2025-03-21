
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage, Language, languageNames } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    console.log(`Changing language from ${language} to ${newLanguage}`);
    // Only change if different to avoid unnecessary re-renders
    if (language !== newLanguage) {
      setLanguage(newLanguage);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200">
        <Languages className="h-4 w-4" />
        <span>{languageNames[language]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem 
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={language === code ? "bg-primary/10 text-primary font-medium" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
