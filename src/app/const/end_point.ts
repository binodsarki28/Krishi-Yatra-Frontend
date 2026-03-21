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
  public static readonly UPDATE_PROFILE: string =
    Endpoint.API_VERSION + 'user/profile';
  public static readonly UPDATE_PASSWORD: string =
    Endpoint.API_VERSION + 'user/password';

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

  //Stock
  public static readonly STOCK_LIST: string = Endpoint.API_VERSION + 'stock/list';
  public static readonly STOCK_CREATE: string = Endpoint.API_VERSION + 'stock/create';
  public static readonly STOCK_UPDATE: string = Endpoint.API_VERSION + 'stock/update';
  public static readonly STOCK_DELETE: string = Endpoint.API_VERSION + 'stock/delete/';
  public static readonly STOCK_DETAILS: string = Endpoint.API_VERSION + 'stock/details/';
  public static readonly MY_STOCKS: string = Endpoint.API_VERSION + 'stock/my-stocks';
  public static readonly STOCK_ADJUST: string = Endpoint.API_VERSION + 'stock/adjust';
  public static readonly CATEGORIES: string = Endpoint.API_VERSION + 'stock/categories';
  public static readonly SUB_CATEGORIES: string = Endpoint.API_VERSION + 'stock/subcategories';

}
