export const formatMoney = (amount) =>
  `$${Math.round(Number(amount) || 0).toLocaleString('en-US')}`;
