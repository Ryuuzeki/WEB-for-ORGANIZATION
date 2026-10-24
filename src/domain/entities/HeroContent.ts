export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImageUrl?: string;
  eyebrow?: string;
  secondaryCtaText?: string;
  stats?: Array<{ value: string; label: string }>;
}
