export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

export const PHASE_COLORS = {
  approvals: '#8b5cf6',
  foundation: '#f59e0b',
  structure: '#3b82f6',
  masonry: '#10b981',
  mep: '#06b6d4',
  finishing: '#f43f5e',
};

export const CATEGORY_COLORS = {
  foundation: '#f59e0b',
  structure: '#3b82f6',
  masonry: '#10b981',
  mep: '#06b6d4',
  finishing: '#f43f5e',
  labour: '#8b5cf6',
};

export const CITIES = [
  'bengaluru', 'mumbai', 'delhi', 'chennai', 'hyderabad',
  'kolkata', 'pune', 'ahmedabad', 'lucknow', 'jaipur', 'kochi', 'chandigarh',
];

export const STATES = {
  bengaluru: 'karnataka', mumbai: 'maharashtra', delhi: 'delhi',
  chennai: 'tamil_nadu', hyderabad: 'telangana', kolkata: 'west_bengal',
  pune: 'maharashtra', ahmedabad: 'gujarat', lucknow: 'uttar_pradesh',
  jaipur: 'rajasthan', kochi: 'kerala', chandigarh: 'chandigarh',
};
