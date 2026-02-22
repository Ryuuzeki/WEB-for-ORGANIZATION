import React from "react";
import { HeroContent } from "@/domain/entities/HeroContent";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import { Waves } from "../components/animations/Waves";

interface HeroContainerProps {
  content: HeroContent;
}

export const HeroContainer: React.FC<HeroContainerProps> = ({ content }) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
      <Waves />
      <div className="max-w-5xl text-center z-10">
        <Typography variant="h1" className="text-primary mb-6">
          {content.title}
        </Typography>
        <Typography variant="p" className="text-secondary mb-10 max-w-2xl mx-auto">
          {content.subtitle}
        </Typography>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size-lg="true">
            {content.ctaText}
          </Button>
          <Button variant="outline">
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </div>
    </section>
  );
};
