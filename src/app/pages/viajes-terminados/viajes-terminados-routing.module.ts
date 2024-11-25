import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViajesTerminadosPage } from './viajes-terminados.page';

const routes: Routes = [
  {
    path: '',
    component: ViajesTerminadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViajesTerminadosPageRoutingModule {}
