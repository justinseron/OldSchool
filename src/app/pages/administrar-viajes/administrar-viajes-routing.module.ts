import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministrarViajesPage } from './administrar-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: AdministrarViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrarViajesPageRoutingModule {}
