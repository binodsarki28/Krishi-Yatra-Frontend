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
  public static readonly GET_ME: string =
    Endpoint.API_VERSION + 'user/me';

  //Farmer
  public static readonly REGISTER_FARMER: string = Endpoint.API_VERSION + 'farmer/register';
  public static readonly LOGIN_FARMER: string = Endpoint.API_VERSION + 'farmer/login';
  public static readonly LIST_FARMERS: string = Endpoint.API_VERSION + 'farmer/list';
  public static readonly VERIFY_FARMER: string = Endpoint.API_VERSION + 'farmer/verify-farmer';
  public static readonly BLOCK_FARMER: string = Endpoint.API_VERSION + 'farmer/block-unblock/';
  public static readonly FARMER_DETAIL: string = Endpoint.API_VERSION + 'farmer/detail/';

  //Buyer
  public static readonly REGISTER_BUYER: string = Endpoint.API_VERSION + 'buyer/register';
  public static readonly LOGIN_BUYER: string = Endpoint.API_VERSION + 'buyer/login';
  public static readonly LIST_BUYERS: string = Endpoint.API_VERSION + 'buyer/list';
  public static readonly VERIFY_BUYER: string = Endpoint.API_VERSION + 'buyer/verify-buyer';
  public static readonly BLOCK_BUYER: string = Endpoint.API_VERSION + 'buyer/block-unblock/';
  public static readonly BUYER_DETAIL: string = Endpoint.API_VERSION + 'buyer/detail/';

  //Delivery
  public static readonly REGISTER_DELIVERY: string = Endpoint.API_VERSION + 'delivery/register';
  public static readonly LOGIN_DELIVERY: string = Endpoint.API_VERSION + 'delivery/login';
  public static readonly LIST_DELIVERY: string = Endpoint.API_VERSION + 'delivery/list';
  public static readonly VERIFY_DELIVERY: string = Endpoint.API_VERSION + 'delivery/verify-delivery';
  public static readonly BLOCK_DELIVERY: string = Endpoint.API_VERSION + 'delivery/block-unblock/';
  public static readonly DELIVERY_DETAIL: string = Endpoint.API_VERSION + 'delivery/detail/';

}
