export const foodCategories = [
  { value: 'appetizers', label: 'Appetizers/Starters' },
  { value: 'mains', label: 'Main Dishes' },
  { value: 'sides', label: 'Side Dishes' },
  { value: 'salads', label: 'Salads' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' },
];

export const checkIsPotLuckEvent = (eventTypes: string[]): boolean => {
  return eventTypes?.includes('pot_luck') || false;
};

export const calculateFoodCoverage = (items: any[]) => {
  const coverage: Record<string, { total: number; confirmed: number; pending: number }> = {};
  
  foodCategories.forEach(cat => {
    coverage[cat.value] = { total: 0, confirmed: 0, pending: 0 };
  });

  items.forEach(item => {
    const category = item.food_type || 'other';
    if (coverage[category]) {
      coverage[category].total++;
      if (item.status === 'confirmed') {
        coverage[category].confirmed++;
      } else if (item.status === 'planned' || item.status === 'pending') {
        coverage[category].pending++;
      }
    }
  });

  return coverage;
};

export const getGuestContributions = (items: any[], guests: any[]) => {
  const contributions: Record<string, any[]> = {};
  
  items.forEach(item => {
    if (item.assigned_guest_id) {
      if (!contributions[item.assigned_guest_id]) {
        contributions[item.assigned_guest_id] = [];
      }
      contributions[item.assigned_guest_id].push(item);
    }
  });

  return contributions;
};

export const getMissingCategories = (coverage: Record<string, { total: number; confirmed: number; pending: number }>) => {
  return foodCategories
    .filter(cat => coverage[cat.value].total === 0)
    .map(cat => cat.label);
};
