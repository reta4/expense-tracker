// Predefined expense categories mapped with their corresponding colors matching Salesforce picklist values
export const PREDEFINED_CATS = {
  'Food':                { color: '#10d9a0', light: 'rgba(16,217,160,0.12)' },
  'Transport':           { color: '#fbbf24', light: 'rgba(251,191,36,0.12)' },
  'Entertainment':       { color: '#a78bfa', light: 'rgba(167,139,250,0.12)' },
  'Bills':               { color: '#f87171', light: 'rgba(248,113,113,0.12)' },
  'Vacation / Travel':   { color: '#38bdf8', light: 'rgba(56,189,248,0.12)' },
  'Family Expenses':     { color: '#f472b6', light: 'rgba(244,114,182,0.12)' },
  'Work / Business':     { color: '#3b82f6', light: 'rgba(59,130,246,0.12)' },
  'Groceries':           { color: '#059669', light: 'rgba(5,150,105,0.12)' },
  'Rent / Mortgage':     { color: '#914dff', light: 'rgba(145,77,255,0.12)' },
  'Utilities':           { color: '#ca8a04', light: 'rgba(202,138,4,0.12)' },
  'Health / Medical':    { color: '#e11d48', light: 'rgba(225,29,72,0.12)' },
  'Gas / Fuel':          { color: '#b45309', light: 'rgba(180,83,9,0.12)' },
  'Public Transport':    { color: '#0d9488', light: 'rgba(13,148,136,0.12)' },
  'Car Maintenance':     { color: '#4b5563', light: 'rgba(75,85,99,0.12)' },
  'Dining Out':          { color: '#ec4899', light: 'rgba(236,72,153,0.12)' },
  'Shopping':            { color: '#84cc16', light: 'rgba(132,204,22,0.12)' },
  'Gym / Fitness':       { color: '#06b6d4', light: 'rgba(6,182,212,0.12)' },
  'Gifts / Donations':   { color: '#14b8a6', light: 'rgba(20,184,166,0.12)' },
  'Education / Courses': { color: '#6366f1', light: 'rgba(99,102,241,0.12)' },
  'Subscriptions':       { color: '#64748b', light: 'rgba(100,116,139,0.12)' },
  'Other':               { color: '#78716c', light: 'rgba(120,113,108,0.12)' }
};

// Generates a fallback dynamic color for custom categories fetched from Salesforce
const generateColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 72%, 55%)`;
};

// Global utility to get configuration metadata for a given category name
export const getCategoryMeta = (name) => {
  if (!name) return { ...PREDEFINED_CATS.Other, label: 'Other' };
  
  if (PREDEFINED_CATS[name]) {
    return { ...PREDEFINED_CATS[name], label: name };
  }
  
  const mainColor = generateColorFromString(name);
  return {
    color: mainColor,
    light: mainColor.replace('55%)', '95%)'),
    label: name
  };
};