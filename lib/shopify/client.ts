interface ShopifyProduct {
  id: string
  title: string
  body_html: string
  vendor: string
  product_type: string
  tags: string
  variants: Array<{
    id: string
    title: string
    price: string
    compare_at_price: string | null
    inventory_quantity: number
  }>
  images: Array<{
    id: string
    src: string
    alt: string | null
  }>
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[]
}

export class ShopifyClient {
  private shop: string
  private accessToken: string

  constructor(shop: string, accessToken: string) {
    this.shop = shop
    this.accessToken = accessToken
  }

  async fetchProducts(limit: number = 250): Promise<ShopifyProduct[]> {
    const allProducts: ShopifyProduct[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const url = `https://${this.shop}/admin/api/2024-10/products.json?limit=${limit}&page=${page}`

      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Shopify API error: ${response.status} - ${error}`)
      }

      const data: ShopifyProductsResponse = await response.json()

      if (data.products.length === 0) {
        hasMore = false
      } else {
        allProducts.push(...data.products)
        page++

        // Shopify rate limit: 2 requests per second
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      // Safety limit: max 1000 products for now
      if (allProducts.length >= 1000) {
        hasMore = false
      }
    }

    return allProducts
  }

  async fetchProduct(productId: string): Promise<ShopifyProduct> {
    const url = `https://${this.shop}/admin/api/2024-10/products/${productId}.json`

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.product
  }

  async getProductCount(): Promise<number> {
    const url = `https://${this.shop}/admin/api/2024-10/products/count.json`

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.count
  }
}
