import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductGrid } from './ProductGrid'
import { ProductType } from '../../models/Product'
import type { Product } from '../../models/Product'

const mockProduct: Product = {
  id: '1',
  name: 'Gin Tonic Premium',
  type: ProductType.DRINK,
  price: 18,
  image: '/test.jpg',
}

describe('ProductGrid', () => {
  describe('CA3: Mensaje de catálogo vacío', () => {
    it('muestra mensaje cuando no hay productos para mostrar', () => {
      render(
        <ProductGrid
          products={[]}
          selectedCategory="ALL"
          orderProductNames={[]}
          onAddProduct={() => {}}
        />
      )

      expect(
        screen.getByText('No hay productos disponibles en esta categoría')
      ).toBeInTheDocument()
    })

    it('muestra mensaje cuando el filtro de categoría no devuelve resultados', () => {
      render(
        <ProductGrid
          products={[]}
          selectedCategory={ProductType.COLD_DISH}
          orderProductNames={[]}
          onAddProduct={() => {}}
        />
      )

      expect(
        screen.getByText('No hay productos disponibles en esta categoría')
      ).toBeInTheDocument()
    })

    it('no muestra el mensaje vacío cuando hay productos', () => {
      render(
        <ProductGrid
          products={[mockProduct]}
          selectedCategory="ALL"
          orderProductNames={[]}
          onAddProduct={() => {}}
        />
      )

      expect(
        screen.queryByText('No hay productos disponibles en esta categoría')
      ).not.toBeInTheDocument()
    })
  })
})
