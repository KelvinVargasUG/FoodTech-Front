import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ProductType, ProductStatus } from '../models/Product'
import type { CatalogProduct } from '../models/Product'

const mockGetActiveProducts = vi.fn()

vi.mock('../services/productService', () => ({
  productService: {
    getActiveProducts: mockGetActiveProducts,
  },
}))

const mockActiveProducts: CatalogProduct[] = [
  {
    id: '1',
    name: 'Gin Tonic',
    type: ProductType.DRINK,
    category: 'Bebidas',
    price: 18,
    status: ProductStatus.ACTIVE,
  },
  {
    id: '2',
    name: 'Risotto de Trufa',
    type: ProductType.HOT_DISH,
    category: 'Platos',
    price: 25,
    status: ProductStatus.ACTIVE,
  },
]

const mockMixedWithInactive: CatalogProduct[] = [
  ...mockActiveProducts,
  {
    id: '3',
    name: 'Producto Inactivo',
    type: ProductType.DRINK,
    category: 'Bebidas',
    price: 10,
    status: ProductStatus.INACTIVE,
  },
]

describe('useCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CA1: Visualización de productos activos', () => {
    it('solo expone productos ACTIVE provenientes del servicio', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockMixedWithInactive)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      expect(result.current.products).toHaveLength(2)
      expect(
        result.current.products.every((p) => p.name !== 'Producto Inactivo')
      ).toBe(true)
    })

    it('inicia con isLoading true y cambia a false tras la carga', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      expect(result.current.isLoading).toBe(true)

      await act(async () => {})

      expect(result.current.isLoading).toBe(false)
    })

    it('expone error cuando el servicio falla', async () => {
      mockGetActiveProducts.mockRejectedValueOnce(new Error('Network error'))

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      expect(result.current.error).not.toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('CA2: Filtrado por categoría', () => {
    it('filtra por DRINK cuando se selecciona DRINK', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSelectedCategory(ProductType.DRINK)
      })

      expect(result.current.products).toHaveLength(1)
      expect(result.current.products[0].name).toBe('Gin Tonic')
    })

    it('muestra todos los productos activos cuando se selecciona ALL', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSelectedCategory(ProductType.DRINK)
      })
      act(() => {
        result.current.setSelectedCategory('ALL')
      })

      expect(result.current.products).toHaveLength(2)
    })
  })

  describe('CA3: Estado vacío', () => {
    it('isEmpty es true cuando el filtro no devuelve resultados', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSelectedCategory(ProductType.COLD_DISH)
      })

      expect(result.current.isEmpty).toBe(true)
    })

    it('isEmpty es false cuando hay productos para la categoría seleccionada', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSelectedCategory(ProductType.DRINK)
      })

      expect(result.current.isEmpty).toBe(false)
    })
  })

  describe('CA4: Búsqueda por nombre', () => {
    it('filtra productos por searchTerm', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSearchTerm('gin')
      })

      expect(result.current.products).toHaveLength(1)
      expect(result.current.products[0].name).toBe('Gin Tonic')
    })

    it('devuelve todos los productos cuando searchTerm está vacío', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSearchTerm('gin')
      })
      expect(result.current.products).toHaveLength(1)

      act(() => {
        result.current.setSearchTerm('')
      })
      expect(result.current.products).toHaveLength(2)
    })

    it('devuelve vacío cuando searchTerm no coincide con nada', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSearchTerm('xyz123')
      })

      expect(result.current.products).toHaveLength(0)
      expect(result.current.isEmpty).toBe(true)
    })

    it('combina filtro de categoría y searchTerm', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSelectedCategory(ProductType.DRINK)
        result.current.setSearchTerm('gin')
      })

      expect(result.current.products).toHaveLength(1)
      expect(result.current.products[0].name).toBe('Gin Tonic')
    })

    it('searchTerm con solo espacios no filtra (trim)', async () => {
      mockGetActiveProducts.mockResolvedValueOnce(mockActiveProducts)

      const { useCatalog } = await import('./useCatalog')
      const { result } = renderHook(() => useCatalog())

      await act(async () => {})

      act(() => {
        result.current.setSearchTerm('   ')
      })

      expect(result.current.products).toHaveLength(2)
    })
  })
})
