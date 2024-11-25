import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificarCodigoPage } from './verificar-codigo.page';

const routes: Routes = [
  {
    path: '',
    component: VerificarCodigoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificarCodigoPageRoutingModule {}
