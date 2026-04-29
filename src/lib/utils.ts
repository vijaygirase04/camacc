
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getGlobalPrice = () => {
  if (typeof window !== 'undefined') {
    return Number(localStorage.getItem('global_price_per_photo')) || 50;
  }
  return 50;
};

export const setGlobalPrice = (price: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('global_price_per_photo', price.toString());
  }
};
