import {Component, OnInit} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";

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
  showLoader: boolean = false;

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

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute,
              private cartService: CartService,) {
  }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {

      this.showLoader = true;

      if (params['url']) {
        this.productService.getProduct(params['url'])
          .subscribe(product => {

            this.cartService.getCart()
              .subscribe(cart => {

                if (cart) {
                  const productInCart = cart.items.find(item => item.product.id === product.id);
                  if (productInCart) {
                    product.countInCart = productInCart.quantity;
                    this.count = product.countInCart;
                  }
                }

                this.product = product;
              })

            this.showLoader = false;
            window.scrollTo(0, 300);
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
        .subscribe(data => {
          this.product.countInCart = this.count;
        })
    }
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe(item => {
        this.product.countInCart = this.count;
      })
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe(item => {
        this.product.countInCart = 0;
        this.count = 1;
      })
  }

}
