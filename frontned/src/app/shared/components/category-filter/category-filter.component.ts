import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {CommonConstants} from "../../constants/common.constants";
import {ActiveParamUtil} from "../../utils/active-params.util";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {

  @Input() categoryWithType: CategoryWithType | null = null;
  @Input() type: string | null = null;

  open: boolean = false;
  activeParams: ActiveParamsType = {types: []};
  from: number | null = null;
  to: number | null = null;

  get title(): string {
    if (this.categoryWithType) {
      return this.categoryWithType.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }
    return '';
  }

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {


      this.activeParams = ActiveParamUtil.processParams(params);

      if (this.type) {
        if (this.type === 'height') {
          if (this.activeParams.heightFrom || this.activeParams.heightTo) {
            this.open = true;
          }
          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null;
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null;

        } else if (this.type === 'diameter') {
          if (this.activeParams.diameterTo || this.activeParams.diameterFrom) {
            this.open = true;
          }
          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null;
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null;
        }
      } else {

        if (params[CommonConstants.types]) {
          this.activeParams.types = Array.isArray(params[CommonConstants.types]) ?
            params[CommonConstants.types] : [params[CommonConstants.types]];
        }

        if (this.categoryWithType && this.categoryWithType.types && this.categoryWithType.types.length > 0
          && this.categoryWithType.types.some(type => this.activeParams.types.find(item => type.url === item))) {
          this.open = true;
        }
      }
    });
  }

  toggle(): void {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean): void {

    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url);
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      } else if (!existingTypeInParams && checked) {
        // push работает не корректно, поэтому делаем через спред
        // this.activeParams.types.push(url);
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }

    this.activeParams.page = 1;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  updateFilterParamFromTo(param: string, value: string): void {
    if (param === CommonConstants.heightTo || param === CommonConstants.heightFrom
      || param === CommonConstants.diameterTo || param === CommonConstants.diameterFrom) {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }

      this.activeParams.page = 1;

      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      })

    }
  }

}
