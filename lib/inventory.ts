export function isLowStock(quantity: number, minThreshold: number): boolean {
  return quantity > 0 && quantity <= minThreshold;
}
export function isOutOfStock(quantity: number): boolean {
  return quantity <= 0;
}
export function applyDelta(quantity: number, delta: number): number {
  return quantity + delta;
}