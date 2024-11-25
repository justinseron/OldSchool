import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilDetallesPage } from './perfil-detalles.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilDetallesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilDetallesPageRoutingModule {}
