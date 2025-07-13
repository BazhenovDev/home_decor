export type CartType = {
  items: CartTypeProduct[]
}

export type CartTypeProduct = {
  product: {
    id: string,
    name: string,
    url: string,
    image: string,
    price: number
  },
  quantity: number
}
