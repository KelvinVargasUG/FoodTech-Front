import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOrder } from './useOrder'
import type { Product } from '../models/Product'
import { ProductType } from '../models/Product'

vi.mock('../services/orderService', () => ({
  orderService: {
    createOrder: vi.fn(() => Promise.resolve({ 
      id: 'order-123', 
      tableNumber: 'A1', 
      status: 'pending', 
      tasks: [] 
    })),
  },
}))

describe('useOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addProduct', () => {
    it('agrega producto nuevo al pedido', () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
      })

      expect(result.current.orderProducts).toHaveLength(1)
      expect(result.current.orderProducts[0].name).toBe('Gin Tonic')
      expect(result.current.orderProducts[0].quantity).toBe(1)
    })

    it('incrementa cantidad si el producto ya existe', () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
        result.current.addProduct(producto)
      })

      expect(result.current.orderProducts).toHaveLength(1)
      expect(result.current.orderProducts[0].quantity).toBe(2)
    })

    it('agrega múltiples productos diferentes', () => {
      const { result } = renderHook(() => useOrder())

      const producto1: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      const producto2: Product = {
        id: '2',
        name: 'Ensalada',
        type: ProductType.FOOD,
        price: 15
      }

      act(() => {
        result.current.addProduct(producto1)
        result.current.addProduct(producto2)
      })

      expect(result.current.orderProducts).toHaveLength(2)
    })
  })

  describe('removeProduct', () => {
    it('elimina producto del pedido', () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
        result.current.removeProduct('Gin Tonic')
      })

      expect(result.current.orderProducts).toHaveLength(0)
    })

    it('decrementa cantidad cuando hay más de 1', () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
        result.current.addProduct(producto)
        result.current.removeProduct('Gin Tonic')
      })

      expect(result.current.orderProducts).toHaveLength(1)
      expect(result.current.orderProducts[0].quantity).toBe(1)
    })

    it('no hace nada si el producto no existe', () => {
      const { result } = renderHook(() => useOrder())

      act(() => {
        result.current.removeProduct('Producto Inexistente')
      })

      expect(result.current.orderProducts).toHaveLength(0)
    })
  })

  describe('clearOrder', () => {
    it('limpia todos los productos del pedido', () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
        result.current.clearOrder()
      })

      expect(result.current.orderProducts).toHaveLength(0)
    })
  })

  describe('submitOrder', () => {
    it('envía el pedido exitosamente', async () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      act(() => {
        result.current.addProduct(producto)
      })

      let response: unknown = null
      await act(async () => {
        response = await result.current.submitOrder('A1')
      })

      expect(response).toBeTruthy()
      expect(result.current.orderProducts).toHaveLength(0)
    })

    it('retorna null y error cuando el pedido está vacío', async () => {
      const { result } = renderHook(() => useOrder())

      let response: unknown = null
      await act(async () => {
        response = await result.current.submitOrder('A1')
      })

      expect(response).toBeNull()
      expect(result.current.error).toBe('El pedido debe contener al menos un producto')
    })

    it('maneja error cuando el servicio falla', async () => {
      const { result } = renderHook(() => useOrder())

      const producto: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      const { orderService } = await import('../services/orderService')
      vi.mocked(orderService.createOrder).mockRejectedValueOnce(new Error('Error de red'))

      act(() => {
        result.current.addProduct(producto)
      })

      let response: unknown = null
      await act(async () => {
        response = await result.current.submitOrder('A1')
      })

      expect(response).toBeNull()
      expect(result.current.error).toBe('Error de red')
    })
  })

  describe('totalItems', () => {
    it('calcula el total de items correctamente', () => {
      const { result } = renderHook(() => useOrder())

      const producto1: Product = {
        id: '1',
        name: 'Gin Tonic',
        type: ProductType.DRINK,
        price: 10
      }

      const producto2: Product = {
        id: '2',
        name: 'Ensalada',
        type: ProductType.FOOD,
        price: 15
      }

      act(() => {
        result.current.addProduct(producto1)
        result.current.addProduct(producto1)
        result.current.addProduct(producto2)
      })

      expect(result.current.totalItems).toBe(3)
    })

    it('retorna 0 cuando no hay productos', () => {
      const { result } = renderHook(() => useOrder())

      expect(result.current.totalItems).toBe(0)
    })
  })
})
