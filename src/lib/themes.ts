export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: {
      primary: string;
      secondary: string;
      accent: string;
      hero: string;
    };
    dark: {
      primary: string;
      secondary: string;
      accent: string;
      hero: string;
    };
  };
}

export const colorThemes: Record<string, ColorTheme> = {
  default: {
    id: 'default',
    name: 'Ocean Blue',
    description: 'Professional and trustworthy',
    colors: {
      light: {
        primary: '210 100% 12%',
        secondary: '210 100% 46%',
        accent: '204 94% 94%',
        hero: '210 100% 12%',
      },
      dark: {
        primary: '210 100% 46%',
        secondary: '210 100% 35%',
        accent: '204 94% 20%',
        hero: '210 100% 8%',
      },
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Forest Green',
    description: 'Natural and growth-focused',
    colors: {
      light: {
        primary: '142 76% 36%',
        secondary: '142 71% 45%',
        accent: '142 76% 94%',
        hero: '142 76% 36%',
      },
      dark: {
        primary: '142 71% 45%',
        secondary: '142 71% 35%',
        accent: '142 76% 20%',
        hero: '142 76% 8%',
      },
    },
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Creative and innovative',
    colors: {
      light: {
        primary: '262 52% 47%',
        secondary: '262 83% 58%',
        accent: '262 83% 94%',
        hero: '262 52% 47%',
      },
      dark: {
        primary: '262 83% 58%',
        secondary: '262 83% 48%',
        accent: '262 52% 20%',
        hero: '262 52% 8%',
      },
    },
  },
  rose: {
    id: 'rose',
    name: 'Sunset Rose',
    description: 'Warm and welcoming',
    colors: {
      light: {
        primary: '346 77% 50%',
        secondary: '346 77% 60%',
        accent: '346 77% 94%',
        hero: '346 77% 50%',
      },
      dark: {
        primary: '346 77% 60%',
        secondary: '346 77% 50%',
        accent: '346 77% 20%',
        hero: '346 77% 8%',
      },
    },
  },
  orange: {
    id: 'orange',
    name: 'Warm Amber',
    description: 'Energetic and vibrant',
    colors: {
      light: {
        primary: '25 95% 43%',
        secondary: '25 95% 53%',
        accent: '25 95% 94%',
        hero: '25 95% 43%',
      },
      dark: {
        primary: '25 95% 53%',
        secondary: '25 95% 43%',
        accent: '25 95% 20%',
        hero: '25 95% 8%',
      },
    },
  },
};
