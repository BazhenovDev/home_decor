import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType, CartTypeProduct} from "../../../../types/cart.type";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  productsInCart: CartTypeProduct[] = [];
  serverStaticPath: string = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: DefaultResponseType | FavoriteType[]) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = (data as FavoriteType[]);

        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message)
            }
            (cartData as CartType).items.forEach(cartItem => {
              this.products.map(item => {

                if (cartItem.product.url === item.url) {
                  item.inCart = true;
                  item.countInCart = cartItem.quantity;
                }

                return item;
              })
            })
            this.productsInCart = (cartData as CartType).items;
          })
      })
  }

  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }
        this.products = this.products.filter(product => product.id !== id);
      })
  }

  updateCount(id: string, count: number) {
    const productInCart: CartTypeProduct | undefined = this.productsInCart.find(item => item.product.id === id);
    if (productInCart) {
      this.cartService.updateCart(id, count)
        .subscribe((data: DefaultResponseType | CartType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message)
          }
          this.productsInCart = (data as CartType).items
        })
    } else {
      const product = this.products.find((productInFavorite: FavoriteType) => {
         return productInFavorite.id === id
      })
      if (product) {
        product.countInCart = count;
      }
    }
  }


  removeFromCart(id: string) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: DefaultResponseType | CartType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message)
        }
        this.productsInCart = ((data as CartType).items);
        this.updateCountAndFlag(id, 0, false);
      })
  }

  addToCart(product: FavoriteType ) {
    const id = product.id;
    const count = product.countInCart || 1;
    this.cartService.updateCart(id, count)
      .subscribe((data: DefaultResponseType | CartType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.updateCountAndFlag(id, count, true);
        this.productsInCart = (data as CartType).items;

      })
  }

  updateCountAndFlag(id: string, count: number, flag: boolean): void {
    const product: FavoriteType | undefined = this.products.find(item => item.id === id);
    if (product) {
      product.countInCart = count;
      product.inCart = flag;
    }
  }

}
