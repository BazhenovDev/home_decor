import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../services/favorite.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number | undefined = 0;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
  isLogged: boolean = false;

  constructor(private cartService: CartService,
              private favoriteService: FavoriteService,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }

    this.authService.isLogged$
      .subscribe((isLogged: boolean) => {
        this.isLogged = isLogged;
      })
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {

        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = this.count;
      })
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.countInCart = this.count;
        })
    }
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
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

  navigate() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }
}
