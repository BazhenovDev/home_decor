import {Component, HostListener, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {ActiveParamUtil} from "../../../shared/utils/active-params.util";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {CommonConstants} from "../../../shared/constants/common.constants";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";


@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  products: ProductType[] = [];
  categoriesWithTypes: CategoryWithType[] = [];
  activeParams: ActiveParamsType = {types: []};
  appliedFilters: AppliedFilterType[] = [];
  sortingOptions: { name: string, value: string }[] = [
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];
  pages: number[] = [];
  sortingOpen: boolean = false;
  showInfoProductNotFound: boolean = false;
  cart: CartType | null = null;
  favoriteProduct: FavoriteType[] | null = null;

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private favoriteService: FavoriteService,
              private cartService: CartService,
              private authService: AuthService,) {
  }

  ngOnInit(): void {

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {

        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = (data as CartType);

        if (this.authService.getIsLoggedIn()) {
          this.favoriteService.getFavorites()
            .subscribe({
              next: (data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error = (data as DefaultResponseType).message;
                  this.processCatalog();
                  throw new Error(error);
                }

                this.favoriteProduct = (data as FavoriteType[]);
                this.processCatalog();

              },
              error: (error) => {
                this.processCatalog()
              }
            })
        } else  {
          this.processCatalog();
        }
      })

  }

  processCatalog() {
    this.categoryService.getCategoriesWithType()
      .subscribe(categories => {
        this.categoriesWithTypes = categories;

        this.activatedRoute.queryParams
          .pipe(debounceTime(800))
          .subscribe(params => {
            this.activeParams = ActiveParamUtil.processParams(params);

            this.appliedFilters = [];
            this.activeParams.types.forEach((url: string) => {

              for (let i = 0; i < this.categoriesWithTypes.length; i++) {
                const foundType = this.categoriesWithTypes[i].types.find(type => type.url === url);
                if (foundType) {
                  this.appliedFilters.push({
                    name: foundType.name,
                    urlParam: foundType.url
                  })
                }
              }
            });

            if (this.activeParams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота от: ' + this.activeParams.heightFrom + ' см',
                urlParam: CommonConstants.heightFrom
              });
            }
            if (this.activeParams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота до: ' + this.activeParams.heightTo + ' см',
                urlParam: CommonConstants.heightTo
              });
            }
            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Диаметр от: ' + this.activeParams.diameterFrom + ' см',
                urlParam: CommonConstants.diameterFrom
              });
            }
            if (this.activeParams.diameterTo) {
              this.appliedFilters.push({
                name: 'Диаметр до: ' + this.activeParams.diameterTo + ' см',
                urlParam: CommonConstants.diameterTo
              });
            }

            this.productService.getProducts(this.activeParams)
              .subscribe(products => {
                this.pages = [];
                for (let i = 1; i <= products.pages; i++) {
                  this.pages.push(i);
                }

                if (this.cart && this.cart.items.length > 0) {
                  this.products = products.items.map(product => {

                    if (this.cart) {
                      const productInCart = this.cart.items.find(item => {
                        return item.product.id === product.id
                      })
                      if (productInCart) {
                        product.countInCart = productInCart.quantity
                      }
                    }

                    return product;
                  });
                } else {
                  this.products = products.items;
                }

                if (this.favoriteProduct) {
                  this.products = this.products.map((product: ProductType) => {
                    const productInFavorite = this.favoriteProduct?.find(item => item.id === product.id);
                    if (productInFavorite) {
                      product.isInFavorite = true;
                    }
                    return product;
                  });
                }

                if (this.products.length === 0) {
                  this.showInfoProductNotFound = true
                } else {
                  this.showInfoProductNotFound = false
                }
              });

          });
      });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType): void {
    if (appliedFilter.urlParam === CommonConstants.heightFrom || appliedFilter.urlParam === CommonConstants.heightTo
      || appliedFilter.urlParam === CommonConstants.diameterFrom || appliedFilter.urlParam === CommonConstants.diameterTo) {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types.filter(type => type !== appliedFilter.urlParam);
    }

    this.activeParams.page = 1;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });

  }

  toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen;
  }

  sort(value: string): void {
    this.activeParams.sort = value;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

  openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    } else if (!this.activeParams.page) {
      this.activeParams.page = 2;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      })
    }
  }

  @HostListener('document:click', ['$event'])
  clickOnWindow(event: Event) {
    if (!(event.target as HTMLElement).className.includes('catalog-sorting-head')
      && this.sortingOpen) {
      this.sortingOpen = false;
    }
  }

}
