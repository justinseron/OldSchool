import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilViajesPage } from './perfil-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilViajesPageRoutingModule {}
