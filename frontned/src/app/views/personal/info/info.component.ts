import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {DeliveryType} from "../../../../types/delivery.type";
import {UserService} from "../../../shared/services/user.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentType = PaymentType;

  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    fatherName: [''],
    phone: [''],
    paymentType: [PaymentType.cashToCourier],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: ['']
  });

  get firstName() {
    return this.userInfoForm.get('firstName');
  }

  get lastName() {
    return this.userInfoForm.get('lastName');
  }

  get fatherName() {
    return this.userInfoForm.get('fatherName');
  }

  get phone() {
    return this.userInfoForm.get('phone');
  }

  get email() {
    return this.userInfoForm.get('email');
  }

  get street() {
    return this.userInfoForm.get('street');
  }

  get house() {
    return this.userInfoForm.get('house');
  }

  get entrance() {
    return this.userInfoForm.get('entrance');
  }

  get apartment() {
    return this.userInfoForm.get('apartment');
  }

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.userService.getUserInfo()
      .subscribe((data: DefaultResponseType | UserInfoType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            const userInfo = data as UserInfoType;

            const paramsToUpdate = {
              firstName: userInfo.firstName || '',
              lastName: userInfo.lastName || '',
              fatherName: userInfo.fatherName || '',
              phone: userInfo.phone || '',
              paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cardOnline,
              email: userInfo.email || '',
              street: userInfo.street || '',
              house: userInfo.house || '',
              entrance: userInfo.entrance || '',
              apartment: userInfo.apartment || '',
            }

            this.userInfoForm.setValue(paramsToUpdate);
            if (userInfo.deliveryType) {
              this.deliveryType = userInfo.deliveryType;
            }

        });
  }

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    this.userInfoForm.markAsDirty();
  }

  updateUserInfo() {

    if (this.userInfoForm.valid) {

      const paramObject: UserInfoType = {
        email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cardOnline
      }

      if (this.userInfoForm.value.firstName) {
        paramObject.firstName = this.userInfoForm.value.firstName;
      }
      if (this.userInfoForm.value.lastName) {
        paramObject.lastName = this.userInfoForm.value.lastName;
      }
      if (this.userInfoForm.value.fatherName) {
        paramObject.fatherName = this.userInfoForm.value.fatherName;
      }
      if (this.userInfoForm.value.phone) {
        paramObject.phone = this.userInfoForm.value.phone;
      }
      if (this.userInfoForm.value.street) {
        paramObject.street = this.userInfoForm.value.street;
      }
      if (this.userInfoForm.value.house) {
        paramObject.house = this.userInfoForm.value.house;
      }
      if (this.userInfoForm.value.entrance) {
        paramObject.entrance = this.userInfoForm.value.entrance;
      }
      if (this.userInfoForm.value.apartment) {
        paramObject.apartment = this.userInfoForm.value.apartment;
      }

      this.userService.updateUserInfo(paramObject)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._snackBar.open(data.message, 'ОК');
              throw new Error(data.message);
            }

            this._snackBar.open(data.message, 'ОК');
            this.userInfoForm.markAsPristine();
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message, 'ОК');
            } else {
              this._snackBar.open('Ошибка сохранения', 'ОК');
            }
          }
          }
        )
    }
  }

}
