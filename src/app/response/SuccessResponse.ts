import {HttpHeaders} from '@angular/common/http';

export interface IResponse {
  message: string;
  fieldName: string;
  httpStatus: string;
  statusCode: number;
  httpHeaders: HttpHeaders;
}

export interface IResponseWithObject {
  message: string;
  statusCode: number;
  response: object;
  totalItems: number;
}
