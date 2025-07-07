import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {DefaultResponseType} from "../../../types/default-response.type";
import {FavoriteType} from "../../../types/favorite.type";
import {ProductType} from "../../../types/product.type";

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(private http: HttpClient) { }

  getFavorites(): Observable<DefaultResponseType | FavoriteType[]> {
    return this.http.get<DefaultResponseType | FavoriteType[]>(`${environment.api}favorites`)
  }

  removeFavorite(productId: string): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(`${environment.api}favorites`, {
      body: {productId: productId}
    })
  }

  addFavorite(productId: string): Observable<DefaultResponseType | FavoriteType> {
    return this.http.post<DefaultResponseType | FavoriteType>(`${environment.api}favorites`, {productId})
  }
}
