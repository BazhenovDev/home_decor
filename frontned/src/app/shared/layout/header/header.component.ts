import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() categories: CategoryWithType[] = [];
  isLogged: boolean = false;
  count: number = 0;

  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private router: Router, private cartService: CartService) {
    this.isLogged = this.authService.getIsLoggedIn()
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLogged: boolean) => {
      this.isLogged = isLogged;
    });

    this.cartService.getCartCount()
      .subscribe(count => {
        this.count = count.count;
      });

    this.cartService.count$.subscribe(count => {
      this.count = count;
    })
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.doLogout();
        },
        error: (error: HttpErrorResponse) => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы', 'ОК');
    this.router.navigate(['/']);
  }

}
