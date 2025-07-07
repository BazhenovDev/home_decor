import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AuthForwardGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.getIsLoggedIn()) {
      this.router.navigate(['/']);
      this._snackBar.open('Вы уже авторизованы', 'ОК');
      return false;
    }

    return true;
  }

}
