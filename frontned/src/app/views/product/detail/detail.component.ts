import {Component, OnInit} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartType} from "../../../../types/cart.type";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private favoriteService: FavoriteService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {

      if (params['url']) {
        this.productService.getProduct(params['url'])
          .subscribe(product => {
            this.product = product;

            this.cartService.getCart()
              .subscribe((cart: CartType | DefaultResponseType) => {

                if ((cart as DefaultResponseType).error !== undefined) {
                  throw new Error((cart as DefaultResponseType).message);
                }

                const cartDataResponse = (cart as CartType);

                if (cartDataResponse) {
                  const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
                  if (productInCart) {
                    this.product.countInCart = productInCart.quantity;
                    this.count = this.product.countInCart;
                  }
                }
              });
            if (this.authService.getIsLoggedIn()) {
              this.favoriteService.getFavorites()
                .subscribe((data: DefaultResponseType | FavoriteType[]) => {
                  if ((data as DefaultResponseType).error !== undefined) {
                    const error = (data as DefaultResponseType).message;
                    throw new Error(error);
                  }
                  const products = (data as FavoriteType[]);
                  const currentProductExists = products.find(product => product.id === this.product.id);
                  if (currentProductExists) {
                    this.product.isInFavorite = true;
                  }
                })
            }
          })
      }
    })

    this.productService.getBestProducts()
      .subscribe(products => {
        this.recommendedProducts = products;
      });
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: DefaultResponseType | CartType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.countInCart = this.count;
        })
    }
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((item: DefaultResponseType | CartType) => {
        if ((item as DefaultResponseType).error !== undefined) {
          throw new Error((item as DefaultResponseType).message);
        }
        this.product.countInCart = this.count;
      })
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((item: DefaultResponseType | CartType) => {
        if ((item as DefaultResponseType).error !== undefined) {
          throw new Error((item as DefaultResponseType).message);
        }
        this.product.countInCart = 0;
        this.count = 1;
      })
  }

  updateFavorite() {

    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return;
    }

    if (this.product.isInFavorite) {

      this.favoriteService.removeFavorite(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            throw new Error(data.message);
          }
          this.product.isInFavorite = false;
        })

    } else {
      this.favoriteService.addFavorite(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.isInFavorite = true;
        });
    }
  }

}
