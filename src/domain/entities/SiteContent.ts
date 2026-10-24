export interface SiteTheme {
  primary: string;
  secondary: string;
  accent: string;
  cta: string;
  background: string;
  cream: string;
  footer: string;
}

export interface HomeAboutContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  memberLabel: string;
  divisionLabel: string;
  programValue: string;
  programLabel: string;
}

export interface HomeStructureContent {
  eyebrow: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface ProgramContentItem {
  label: string;
  title: string;
  description: string;
}

export interface HomeProgramContent {
  eyebrow: string;
  title: string;
  description: string;
  items: ProgramContentItem[];
}

export interface HomeCalendarContent {
  eyebrow: string;
  reminderLabel: string;
  emptyText: string;
  todayButtonText: string;
}

export interface HomeDocumentsContent {
  title: string;
  description: string;
  buttonText: string;
  downloadText: string;
}

export interface HomeFooterContent {
  brandTitle: string;
  description: string;
  exploreTitle: string;
  quickAccessTitle: string;
  copyright: string;
  closingText: string;
}

export interface SiteContent {
  theme: SiteTheme;
  sidebar: {
    brandTitle: string;
    brandSubtitle: string;
    adminTitle: string;
    adminSubtitle: string;
  };
  home: {
    about: HomeAboutContent;
    structure: HomeStructureContent;
    program: HomeProgramContent;
    calendar: HomeCalendarContent;
    documents: HomeDocumentsContent;
    footer: HomeFooterContent;
  };
}
