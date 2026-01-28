import { calculateProfit, formatCurrency } from '../lib/calculator'

describe('Calculator Functions', () => {
  describe('calculateProfit', () => {
    it('calculates profit correctly with standard fees', () => {
      const result = calculateProfit({
        buyPrice: 50.00,
        buyShipping: 2.99,
        sellPrice: 75.00,
        sellShipping: 5.50,
      })

      // Expected calculation:
      // Revenue: $75.00
      // Costs: $50.00 + $2.99 + $5.50 = $58.49
      // eBay fees: $75.00 * 0.1325 + $0.30 = $9.94 + $0.30 = $10.24
      // Net profit: $75.00 - $58.49 - $10.24 = $6.27
      
      expect(result.netProfit).toBeCloseTo(6.27, 2)
      expect(result.roi).toBeGreaterThan(0)
      expect(result.profitMargin).toBeGreaterThan(0)
    })

    it('handles zero profit scenarios', () => {
      const result = calculateProfit({
        buyPrice: 70.00,
        buyShipping: 5.00,
        sellPrice: 75.00,
        sellShipping: 5.50,
      })

      expect(result.netProfit).toBeLessThan(5) // Should be negative or very low
    })

    it('validates input parameters', () => {
      expect(() => {
        calculateProfit({
          buyPrice: -10,
          buyShipping: 0,
          sellPrice: 50,
          sellShipping: 5,
        })
      }).toThrow()
    })
  })

  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(25.50)).toBe('$25.50')
      expect(formatCurrency(1000.99)).toBe('$1,000.99')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-15.75)).toBe('-$15.75')
    })

    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })
})