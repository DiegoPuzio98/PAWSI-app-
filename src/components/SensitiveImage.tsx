import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SensitiveImageProps {
  src: string;
  alt: string;
  className?: string;
  isSensitive?: boolean;
  disableReveal?: boolean;
  onError?: (e: any) => void;
}

export function SensitiveImage({ src, alt, className, isSensitive = false, disableReveal = false, onError }: SensitiveImageProps) {
  const [revealed, setRevealed] = useState(false);

  if (!isSensitive) {
    return <img src={src} alt={alt} className={className} onError={onError} />;
  }

  if (!revealed) {
    return (
      <div 
        className={`${className} bg-muted flex items-center justify-center relative cursor-pointer`}
        onClick={() => setRevealed(true)}
        role="button"
        aria-label="Revelar contenido sensible"
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20 flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-sm font-medium mb-2 text-foreground">
            Contenido potencialmente sensible
          </p>
          {!disableReveal && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => { e.stopPropagation(); setRevealed(true); }}
              className="bg-background/80"
            >
              ¿Ver de todas formas?
            </Button>
          )}
        </div>
        <img 
          src={src} 
          alt={alt} 
          className={`${className} blur-md`}
          onError={onError}
        />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={onError} />;
}