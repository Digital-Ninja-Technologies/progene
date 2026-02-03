import {
  ProjectConfig,
  PricingResult,
  ProposalData,
  BASE_HOURS,
  HOURS_PER_PAGE,
  URGENCY_MULTIPLIERS,
  INTEGRATIONS,
  PROJECT_TYPES,
} from '@/types/project';

export function calculatePricing(config: ProjectConfig): PricingResult {
  if (!config.type) {
    return {
      estimatedHours: 0,
      minPrice: 0,
      recommendedPrice: 0,
      premiumPrice: 0,
      timelineWeeks: 0,
      complexityLevel: 'Simple',
    };
  }

  // Start with base hours
  let hours = BASE_HOURS[config.type];

  // Add hours for pages
  hours += config.pages * HOURS_PER_PAGE[config.type];

  // CMS adds 15% more hours
  if (config.cmsNeeded) {
    hours *= 1.15;
  }

  // Calculate integration multiplier
  let integrationMultiplier = 1;
  config.integrations.forEach((integrationId) => {
    const integration = INTEGRATIONS.find((i) => i.id === integrationId);
    if (integration) {
      integrationMultiplier *= integration.multiplier;
    }
  });
  hours *= integrationMultiplier;

  // Animations add 20% more hours
  if (config.animations) {
    hours *= 1.2;
  }

  // Apply urgency multiplier
  const urgencyConfig = URGENCY_MULTIPLIERS[config.urgency];
  hours *= urgencyConfig.multiplier;

  // Maintenance adds 5 hours for initial setup discussion
  if (config.maintenance) {
    hours += 5;
  }

  // Round hours
  hours = Math.round(hours);

  // Calculate timeline in weeks (assuming 20 productive hours per week)
  const baseWeeks = Math.ceil(hours / 20);
  const timelineWeeks = Math.max(1, Math.round(baseWeeks * urgencyConfig.weeks));

  // Determine complexity
  let complexityLevel: PricingResult['complexityLevel'];
  if (hours <= 30) {
    complexityLevel = 'Simple';
  } else if (hours <= 60) {
    complexityLevel = 'Medium';
  } else if (hours <= 100) {
    complexityLevel = 'Complex';
  } else {
    complexityLevel = 'Enterprise';
  }

  // Calculate prices
  const basePrice = hours * config.hourlyRate;
  const minPrice = Math.round(basePrice * 0.85);
  const recommendedPrice = Math.round(basePrice);
  const premiumPrice = Math.round(basePrice * 1.2);

  return {
    estimatedHours: hours,
    minPrice,
    recommendedPrice,
    premiumPrice,
    timelineWeeks,
    complexityLevel,
  };
}

export function generateProposal(config: ProjectConfig, pricing: PricingResult): ProposalData {
  const projectTypeLabel = PROJECT_TYPES.find((p) => p.value === config.type)?.label || 'Website';

  // Generate scope of work
  const scopeOfWork = [
    `Design and develop a custom ${projectTypeLabel}`,
    `${config.pages} unique page templates with responsive design`,
  ];

  if (config.cmsNeeded) {
    scopeOfWork.push('Content Management System setup and configuration');
    scopeOfWork.push('Admin training for content updates');
  }

  if (config.integrations.length > 0) {
    const integrationLabels = config.integrations.map(
      (id) => INTEGRATIONS.find((i) => i.id === id)?.label || id
    );
    scopeOfWork.push(`Third-party integrations: ${integrationLabels.join(', ')}`);
  }

  if (config.animations) {
    scopeOfWork.push('Custom animations and micro-interactions');
    scopeOfWork.push('Smooth page transitions and scroll effects');
  }

  scopeOfWork.push('Cross-browser testing and optimization');
  scopeOfWork.push('Mobile and tablet responsive design');
  scopeOfWork.push('Performance optimization and SEO basics');

  if (config.maintenance) {
    scopeOfWork.push('Post-launch support and maintenance plan discussion');
  }

  // Generate deliverables
  const deliverables = [
    'Fully functional website deployed to production',
    'Source code and design files',
    'Documentation for website management',
  ];

  if (config.cmsNeeded) {
    deliverables.push('CMS admin credentials and setup guide');
    deliverables.push('30-minute training video for content updates');
  }

  if (config.type?.includes('wordpress')) {
    deliverables.push('WordPress theme files (child theme if applicable)');
    deliverables.push('Plugin list and configuration documentation');
  }

  if (config.type?.includes('framer')) {
    deliverables.push('Framer project with edit access');
    deliverables.push('Component library documentation');
  }

  // Generate milestones
  const milestones = [];
  const weeksPerMilestone = Math.ceil(pricing.timelineWeeks / 3);

  milestones.push({
    name: 'Discovery & Design',
    duration: `Week 1${weeksPerMilestone > 1 ? `-${weeksPerMilestone}` : ''}`,
    payment: 30,
  });

  milestones.push({
    name: 'Development',
    duration: `Week ${weeksPerMilestone + 1}-${weeksPerMilestone * 2}`,
    payment: 40,
  });

  milestones.push({
    name: 'Testing & Launch',
    duration: `Week ${weeksPerMilestone * 2 + 1}-${pricing.timelineWeeks}`,
    payment: 30,
  });

  // Generate payment structure
  const paymentStructure = [
    {
      label: 'Deposit (on signing)',
      percentage: 50,
      amount: Math.round(pricing.recommendedPrice * 0.5),
    },
    {
      label: 'Final Payment (on delivery)',
      percentage: 50,
      amount: Math.round(pricing.recommendedPrice * 0.5),
    },
  ];

  return {
    config,
    pricing,
    scopeOfWork,
    deliverables,
    milestones,
    paymentStructure,
  };
}
