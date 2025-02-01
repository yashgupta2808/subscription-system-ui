export const SUBSCRIPTION_PLANS = [
    { value: 'Basic', label: 'Basic - Rs. 99' },
    { value: 'Standard', label: 'Standard - Rs. 149' },
    { value: 'Premium', label: 'Premium - Rs. 299' }
];

export const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };