import { Component, OnInit } from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {OrderType} from "../../../../types/order.type";
import {OrderStatusType} from "../../../../types/order-status.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  orders: OrderType[] = [];

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.orderService.getOrders()
      .subscribe((data: DefaultResponseType | OrderType[]) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.orders = (data as OrderType[]).map(item => {
          const status: {name: string, color: string} = OrderStatusUtil.getStatusAndColor(item.status);

          item.statusRus = status.name;
          item.color = status.color;

          return item;
        });
      })
  }

  protected readonly OrderStatusType = OrderStatusType;
  protected readonly OrderStatusUtil = OrderStatusUtil;
}
