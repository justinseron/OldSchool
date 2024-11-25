import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagesPage } from './pages.page';

const routes: Routes = [
  {
    path: '',
    component: PagesPage
  },  {
    path: 'perfil-viajes',
    loadChildren: () => import('./perfil-viajes/perfil-viajes.module').then( m => m.PerfilViajesPageModule)
  },
  {
    path: 'viajes-terminados',
    loadChildren: () => import('./viajes-terminados/viajes-terminados.module').then( m => m.ViajesTerminadosPageModule)
  },
  {
    path: 'perfil-detalles',
    loadChildren: () => import('./perfil-detalles/perfil-detalles.module').then( m => m.PerfilDetallesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesPageRoutingModule {}
