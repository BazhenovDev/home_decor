export type FavoriteType = {
  id: string,
  name: string,
  url: string,
  image: string,
  price: number,
  inCart?: boolean,
  countInCart?: number
}
