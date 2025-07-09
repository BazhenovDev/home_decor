import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OrderType} from "../../../types/order.type";
import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  createOrder(body: OrderType): Observable<OrderType | DefaultResponseType>  {
    return this.http.post<OrderType | DefaultResponseType>(environment.api + 'orders', body, {withCredentials: true});
  }
}
