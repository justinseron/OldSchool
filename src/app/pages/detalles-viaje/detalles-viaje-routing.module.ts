import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesViajePage } from './detalles-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesViajePageRoutingModule {}
