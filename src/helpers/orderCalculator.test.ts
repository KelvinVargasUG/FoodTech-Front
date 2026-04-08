import { describe, it, expect } from 'vitest'
import { calculateTotalPrice, calculateTotalItems } from './orderCalculator'
import type { OrderProduct } from '../models/Product'

describe('calculateTotalPrice', () => {
  it('retorna 0 para pedido vacío', () => {
    const result = calculateTotalPrice([])
    expect(result).toBe(0)
  })

  it('retorna el precio total multiplicando quantity por price', () => {
    const pedido: OrderProduct[] = [
      { name: 'Gin Tonic', type: 'DRINK' as const, quantity: 2, price: 10 },
      { name: 'Risotto', type: 'HOT_DISH' as const, quantity: 1, price: 25 },
    ]
    const result = calculateTotalPrice(pedido)
    expect(result).toBe(45) 
  })

  it('retorna precio directo si hay un solo producto', () => {
    const pedido: OrderProduct[] = [
      { name: 'Vino', type: 'DRINK' as const, quantity: 3, price: 8 },
    ]
    const result = calculateTotalPrice(pedido)
    expect(result).toBe(24) 
  })
})

describe('calculateTotalItems', () => {
  it('retorna 0 para pedido vacío', () => {
    const result = calculateTotalItems([])
    expect(result).toBe(0)
  })

  it('retorna la suma de quantities', () => {
    const pedido: OrderProduct[] = [
      { name: 'Gin Tonic', type: 'DRINK' as const, quantity: 2, price: 10 },
      { name: 'Risotto', type: 'HOT_DISH' as const, quantity: 3, price: 25 },
    ]
    const result = calculateTotalItems(pedido)
    expect(result).toBe(5)
  })

  it('retorna quantity directo si hay un solo producto', () => {
    const pedido: OrderProduct[] = [
      { name: 'Vino', type: 'DRINK' as const, quantity: 5, price: 8 },
    ]
    const result = calculateTotalItems(pedido)
    expect(result).toBe(5)
  })
})
