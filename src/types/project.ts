export type ProjectType = 
  | 'framer-landing'
  | 'framer-marketing'
  | 'webflow-landing'
  | 'webflow-marketing'
  | 'webflow-ecommerce'
  | 'wordpress-blog'
  | 'wordpress-business'
  | 'wordpress-ecommerce'
  | 'wordpress-membership';

export type TimelineUrgency = 'normal' | 'fast' | 'urgent';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface ProjectConfig {
  type: ProjectType | null;
  pages: number;
  cmsNeeded: boolean;
  integrations: string[];
  animations: boolean;
  urgency: TimelineUrgency;
  maintenance: boolean;
  hourlyRate: number;
  currency: Currency;
}

export interface PricingResult {
  estimatedHours: number;
  minPrice: number;
  recommendedPrice: number;
  premiumPrice: number;
  timelineWeeks: number;
  complexityLevel: 'Simple' | 'Medium' | 'Complex' | 'Enterprise';
}

export interface ProposalData {
  config: ProjectConfig;
  pricing: PricingResult;
  scopeOfWork: string[];
  deliverables: string[];
  milestones: { name: string; duration: string; payment: number }[];
  paymentStructure: { label: string; percentage: number; amount: number }[];
}

export const PROJECT_TYPES: { value: ProjectType; label: string; description: string; icon: string }[] = [
  {
    value: 'framer-landing',
    label: 'Framer Landing Page',
    description: 'Single-page marketing or product landing page',
    icon: '🎯',
  },
  {
    value: 'framer-marketing',
    label: 'Framer Marketing Website',
    description: 'Multi-page marketing website with animations',
    icon: '✨',
  },
  {
    value: 'webflow-landing',
    label: 'Webflow Landing Page',
    description: 'High-converting landing page with interactions',
    icon: '🚀',
  },
  {
    value: 'webflow-marketing',
    label: 'Webflow Marketing Website',
    description: 'Multi-page marketing site with CMS',
    icon: '💼',
  },
  {
    value: 'webflow-ecommerce',
    label: 'Webflow E-commerce',
    description: 'Online store with Webflow Commerce',
    icon: '🛍️',
  },
  {
    value: 'wordpress-blog',
    label: 'WordPress Blog',
    description: 'Content-focused blog with custom theme',
    icon: '📝',
  },
  {
    value: 'wordpress-business',
    label: 'WordPress Business Site',
    description: 'Professional business website with CMS',
    icon: '🏢',
  },
  {
    value: 'wordpress-ecommerce',
    label: 'WordPress E-commerce',
    description: 'Online store with WooCommerce',
    icon: '🛒',
  },
  {
    value: 'wordpress-membership',
    label: 'WordPress Membership',
    description: 'Members-only content with subscriptions',
    icon: '🔐',
  },
];

export const INTEGRATIONS = [
  { id: 'forms', label: 'Contact Forms', multiplier: 1.05 },
  { id: 'crm', label: 'CRM Integration', multiplier: 1.12 },
  { id: 'email', label: 'Email Marketing', multiplier: 1.08 },
  { id: 'payments', label: 'Payment Processing', multiplier: 1.15 },
  { id: 'analytics', label: 'Advanced Analytics', multiplier: 1.05 },
  { id: 'social', label: 'Social Media', multiplier: 1.04 },
  { id: 'booking', label: 'Booking System', multiplier: 1.18 },
  { id: 'chat', label: 'Live Chat', multiplier: 1.06 },
];

export const CURRENCIES: { value: Currency; symbol: string; label: string }[] = [
  { value: 'USD', symbol: '$', label: 'US Dollar' },
  { value: 'EUR', symbol: '€', label: 'Euro' },
  { value: 'GBP', symbol: '£', label: 'British Pound' },
  { value: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { value: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

// Base hours per project type
export const BASE_HOURS: Record<ProjectType, number> = {
  'framer-landing': 16,
  'framer-marketing': 32,
  'webflow-landing': 18,
  'webflow-marketing': 36,
  'webflow-ecommerce': 56,
  'wordpress-blog': 24,
  'wordpress-business': 40,
  'wordpress-ecommerce': 64,
  'wordpress-membership': 56,
};

// Hours per page by project type
export const HOURS_PER_PAGE: Record<ProjectType, number> = {
  'framer-landing': 3,
  'framer-marketing': 4,
  'webflow-landing': 3.5,
  'webflow-marketing': 4,
  'webflow-ecommerce': 4.5,
  'wordpress-blog': 2,
  'wordpress-business': 3,
  'wordpress-ecommerce': 4,
  'wordpress-membership': 4,
};

// Urgency multipliers
export const URGENCY_MULTIPLIERS: Record<TimelineUrgency, { multiplier: number; weeks: number }> = {
  normal: { multiplier: 1.0, weeks: 1 },
  fast: { multiplier: 1.25, weeks: 0.7 },
  urgent: { multiplier: 1.5, weeks: 0.5 },
};
