import { isLowStock, isOutOfStock, applyDelta } from "@/lib/inventory";

describe("inventory logic", () => {
  it("low stock when 0 < qty <= threshold", () => {
    expect(isLowStock(3, 5)).toBe(true);
    expect(isLowStock(0, 5)).toBe(false);
    expect(isLowStock(6, 5)).toBe(false);
  });
  it("out of stock when qty <= 0", () => {
    expect(isOutOfStock(0)).toBe(true);
    expect(isOutOfStock(-1)).toBe(true);
    expect(isOutOfStock(1)).toBe(false);
  });
  it("apply delta", () => {
    expect(applyDelta(10, -3)).toBe(7);
    expect(applyDelta(7, 5)).toBe(12);
  });
});