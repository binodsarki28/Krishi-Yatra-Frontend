export class Endpoint {

  public static readonly API_VERSION: string = 'api/v1/';

  //User
  public static readonly CREATE_USER: string =
    Endpoint.API_VERSION + 'user/register';
  public static readonly LOGIN_USER: string =
    Endpoint.API_VERSION + 'user/login';
  public static readonly VERIFY_OTP: string =
    Endpoint.API_VERSION + 'user/verify-otp';
  public static readonly RESEND_OTP: string =
    Endpoint.API_VERSION + 'user/resend-otp';

}
