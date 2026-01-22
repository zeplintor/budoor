/**
 * Design System Tokens - Intelly Style
 *
 * Ce fichier centralise tous les tokens de design pour maintenir
 * la cohérence à travers l'application.
 */

export const colors = {
  // Backgrounds
  background: {
    primary: '#FDF8F3',      // Crème/beige - fond principal
    secondary: '#FFFFFF',     // Blanc - cards
    dark: '#1A1A1A',          // Noir - sidebar
    darkHover: '#2A2A2A',     // Noir hover
    muted: '#F5F0EB',         // Beige muted
  },

  // Text
  text: {
    primary: '#1A1A1A',       // Noir
    secondary: '#6B7280',     // Gris
    muted: '#9CA3AF',         // Gris clair
    inverse: '#FFFFFF',       // Blanc (sur fond sombre)
    inverseSecondary: '#A1A1AA', // Gris clair (sur fond sombre)
  },

  // Accent Colors
  accent: {
    pink: '#FFB5BA',          // Rose pastel
    pinkLight: '#FFD4D8',     // Rose clair
    pinkDark: '#E89399',      // Rose foncé

    yellow: '#F9D949',        // Jaune
    yellowLight: '#FBE588',   // Jaune clair
    yellowDark: '#E5C33E',    // Jaune foncé

    mint: '#A8E6CF',          // Menthe
    mintLight: '#C8F0DE',     // Menthe clair
    mintDark: '#7DD3B0',      // Menthe foncé

    purple: '#D4A5FF',        // Violet
    purpleLight: '#E4C8FF',   // Violet clair
    purpleDark: '#B87DE8',    // Violet foncé

    coral: '#FFB088',         // Corail
    coralLight: '#FFCDB8',    // Corail clair
    coralDark: '#E89066',     // Corail foncé
  },

  // Status Colors
  status: {
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Border
  border: {
    light: '#E5E7EB',
    dark: '#2A2A2A',
    muted: '#F0EBE6',
  },
} as const;

export const spacing = {
  sidebar: '280px',           // Largeur de la sidebar
  sidebarCollapsed: '80px',   // Sidebar réduite
  headerHeight: '64px',       // Hauteur du header
  containerPadding: '24px',   // Padding des containers
  cardPadding: '20px',        // Padding des cards
  gap: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  cardHover: '0 8px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    arabic: 'var(--font-arabic), system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// CSS Custom Properties export pour usage dans globals.css
export const cssVariables = `
  /* Colors - Background */
  --bg-primary: ${colors.background.primary};
  --bg-secondary: ${colors.background.secondary};
  --bg-dark: ${colors.background.dark};
  --bg-dark-hover: ${colors.background.darkHover};
  --bg-muted: ${colors.background.muted};

  /* Colors - Text */
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-muted: ${colors.text.muted};
  --text-inverse: ${colors.text.inverse};
  --text-inverse-secondary: ${colors.text.inverseSecondary};

  /* Colors - Accent */
  --accent-pink: ${colors.accent.pink};
  --accent-pink-light: ${colors.accent.pinkLight};
  --accent-yellow: ${colors.accent.yellow};
  --accent-yellow-light: ${colors.accent.yellowLight};
  --accent-mint: ${colors.accent.mint};
  --accent-mint-light: ${colors.accent.mintLight};
  --accent-purple: ${colors.accent.purple};
  --accent-purple-light: ${colors.accent.purpleLight};
  --accent-coral: ${colors.accent.coral};
  --accent-coral-light: ${colors.accent.coralLight};

  /* Colors - Status */
  --status-success: ${colors.status.success};
  --status-success-light: ${colors.status.successLight};
  --status-warning: ${colors.status.warning};
  --status-warning-light: ${colors.status.warningLight};
  --status-error: ${colors.status.error};
  --status-error-light: ${colors.status.errorLight};

  /* Colors - Border */
  --border-light: ${colors.border.light};
  --border-dark: ${colors.border.dark};
  --border-muted: ${colors.border.muted};

  /* Spacing */
  --sidebar-width: ${spacing.sidebar};
  --sidebar-collapsed: ${spacing.sidebarCollapsed};
  --header-height: ${spacing.headerHeight};

  /* Border Radius */
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  --radius-2xl: ${borderRadius['2xl']};

  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-card: ${shadows.card};
  --shadow-card-hover: ${shadows.cardHover};
`;
