export function priceForVariant(monthlyPrice: number, variant: "A"|"B") {
  if (variant === "B") {
    if (monthlyPrice === 25) return 15;
    if (monthlyPrice === 29) return 19;
    return Math.max(0, monthlyPrice - 10);
  }
  return monthlyPrice;
}