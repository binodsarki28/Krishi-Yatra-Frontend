import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'farmer/stocks/update/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'farmer/stocks/details/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
