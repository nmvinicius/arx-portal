import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'simulacao',
    loadComponent: () => import('./pages/simulacao/simulacao').then((m) => m.Simulacao),
  },
  {
    path: 'v/:code',
    loadComponent: () => import('./pages/simulacao/simulacao').then((m) => m.Simulacao),
  },
  {
    path: 'proposta',
    loadComponent: () => import('./pages/proposta/proposta').then((m) => m.Proposta),
  },
  { path: '**', redirectTo: '' },
];
