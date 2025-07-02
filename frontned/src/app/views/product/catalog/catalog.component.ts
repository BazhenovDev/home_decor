import {Component, OnInit} from '@angular/core';
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
  showLoader: boolean = false;
  cart: CartType | null = null;

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private cartService: CartService,) {
  }

  ngOnInit(): void {

    this.cartService.getCart()
      .subscribe(data => {
        this.cart = data;
      })

    window.scrollTo(0, 300);

    this.categoryService.getCategoriesWithType()
      .subscribe(categories => {
        this.showLoader = true;
        this.categoriesWithTypes = categories;

        this.activatedRoute.queryParams
          .pipe(debounceTime(800))
          .subscribe(params => {
            this.showLoader = true;
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
                      const productInCart = this.cart.items.find( item => {
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

                if (this.products.length === 0) {
                  this.showInfoProductNotFound = true
                } else {
                  this.showInfoProductNotFound = false
                }

                this.showLoader = false;


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
    }
  }

}
