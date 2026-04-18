import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'farmer/stocks/update/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'farmer/stocks/details/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'stock-detail/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'demands',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'order/create/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'delivery/track/:orderId',
    renderMode: RenderMode.Client
  },
  {
    path: 'farmer/orders/track/:orderId',
    renderMode: RenderMode.Client
  },
  {
    path: 'buyer/orders/track/:orderId',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
