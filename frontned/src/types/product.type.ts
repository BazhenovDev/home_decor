export type ProductType = {
  id: string,
  name: string,
  price: number,
  image: string,
  url: string,
  lightning?: string,
  humidity?: string,
  temperature?: string,
  height?: number,
  diameter?: number,
  type: {
    id: string,
    name: string,
    url: string,
  },
  countInCart?: number,
}
