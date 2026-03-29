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
  public static readonly REGISTER_FARMER: string =
    Endpoint.API_VERSION + 'farmer/register';
  public static readonly LOGIN_FARMER: string =
    Endpoint.API_VERSION + 'farmer/login';
  public static readonly LIST_FARMERS: string =
    Endpoint.API_VERSION + 'farmer/list';
  public static readonly VERIFY_FARMER: string =
    Endpoint.API_VERSION + 'farmer/verify-farmer';
  public static readonly BLOCK_FARMER: string =
    Endpoint.API_VERSION + 'farmer/block-unblock/';
  public static readonly FARMER_DETAIL: string = Endpoint.API_VERSION + 'farmer/detail/';

  //Buyer
  public static readonly REGISTER_BUYER: string =
    Endpoint.API_VERSION + 'buyer/register';
  public static readonly LOGIN_BUYER: string =
    Endpoint.API_VERSION + 'buyer/login';
  public static readonly LIST_BUYERS: string =
    Endpoint.API_VERSION + 'buyer/list';
  public static readonly VERIFY_BUYER: string =
    Endpoint.API_VERSION + 'buyer/verify-buyer';
  public static readonly BLOCK_BUYER: string =
    Endpoint.API_VERSION + 'buyer/block-unblock/';
  public static readonly BUYER_DETAIL: string =
    Endpoint.API_VERSION + 'buyer/detail/';

  //Delivery
  public static readonly REGISTER_DELIVERY: string =
    Endpoint.API_VERSION + 'delivery/register';
  public static readonly LOGIN_DELIVERY: string =
    Endpoint.API_VERSION + 'delivery/login';
  public static readonly LIST_DELIVERY: string =
    Endpoint.API_VERSION + 'delivery/list';
  public static readonly VERIFY_DELIVERY: string =
    Endpoint.API_VERSION + 'delivery/verify-delivery';
  public static readonly BLOCK_DELIVERY: string =
    Endpoint.API_VERSION + 'delivery/block-unblock/';
  public static readonly DELIVERY_DETAIL: string =
    Endpoint.API_VERSION + 'delivery/detail/';

  //Stock
  public static readonly STOCK_LIST: string =
    Endpoint.API_VERSION + 'stock/list';
  public static readonly STOCK_CREATE: string =
    Endpoint.API_VERSION + 'stock/create';
  public static readonly STOCK_UPDATE: string =
    Endpoint.API_VERSION + 'stock/update';
  public static readonly STOCK_DELETE: string =
    Endpoint.API_VERSION + 'stock/delete/';
  public static readonly STOCK_DETAILS: string =
    Endpoint.API_VERSION + 'stock/details/';
  public static readonly MY_STOCKS: string =
    Endpoint.API_VERSION + 'stock/my-stocks';
  public static readonly STOCK_ADJUST: string =
    Endpoint.API_VERSION + 'stock/adjust';
  public static readonly CATEGORIES: string =
    Endpoint.API_VERSION + 'stock/categories';
  public static readonly SUB_CATEGORIES: string =
    Endpoint.API_VERSION + 'stock/subcategories';

  //Address
  public static readonly ADDRESS_SAVE: string =
    Endpoint.API_VERSION + 'address/save';
  public static readonly ADDRESS_ME: string =
    Endpoint.API_VERSION + 'address/me';
  public static readonly ADDRESS_DELETE: string =
    Endpoint.API_VERSION + 'address/delete';

  //Order
  public static readonly ORDER_CREATE: string =
    Endpoint.API_VERSION + 'order/create';
  public static readonly ORDER_PENDING: string =
    Endpoint.API_VERSION + 'order/pending';
  public static readonly ORDER_ACCEPT: string =
    Endpoint.API_VERSION + 'order/delivery/accept/';
  public static readonly ORDER_ACCEPTED: string =
    Endpoint.API_VERSION + 'order/linker/accepted';
  public static readonly ORDER_FARMER_ADDRESS: string =
    Endpoint.API_VERSION + 'order/farmer-address/';
  public static readonly ORDER_DETAILS: string =
    Endpoint.API_VERSION + 'order/detail/';
  public static readonly ORDER_UPDATE_CHECKPOINTS: string =
    Endpoint.API_VERSION + 'order/update-checkpoints/';
  public static readonly ORDER_MARK_AS_DELIVERED: string =
    Endpoint.API_VERSION + 'order/mark-as-delivered/';
  public static readonly ORDER_PICKED_UP: string =
    Endpoint.API_VERSION + 'order/mark-as-picked-up/';
  public static readonly ORDER_REPORT_CONFLICT: string =
    Endpoint.API_VERSION + 'order/report-conflict/';
  public static readonly ORDER_RESOLVE_CONFLICT: string =
    Endpoint.API_VERSION + 'order/resolve-conflict/';

  // Role-specific order lists
  public static readonly ORDER_BUYER_LIST: string =
    Endpoint.API_VERSION + 'order/buyer/my-orders';
  public static readonly ORDER_FARMER_LIST: string =
    Endpoint.API_VERSION + 'order/farmer/my-orders';
  public static readonly ORDER_DELIVERY_LIST: string =
    Endpoint.API_VERSION + 'order/delivery/my-orders';

  // Global order list (Admin)
  public static readonly ORDER_LIST: string =
    Endpoint.API_VERSION + 'order/list';

  // Demand
  public static readonly DEMAND_CREATE: string =
    Endpoint.API_VERSION + 'demand/create';
  public static readonly DEMAND_LIST: string =
    Endpoint.API_VERSION + 'demand/list';
  public static readonly DEMAND_MY: string =
    Endpoint.API_VERSION + 'demand/my-demands';
  public static readonly DEMAND_FULFILLED: string =
    Endpoint.API_VERSION + 'demand/farmer-fulfilled';
  public static readonly DEMAND_CANCEL: string =
    Endpoint.API_VERSION + 'demand/cancel/';
  public static readonly DEMAND_ACCEPT: string =
    Endpoint.API_VERSION + 'demand/accept/';
}

