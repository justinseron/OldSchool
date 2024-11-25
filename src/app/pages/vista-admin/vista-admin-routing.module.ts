import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VistaAdminPage } from './vista-admin.page';

const routes: Routes = [
  {
    path: '',
    component: VistaAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistaAdminPageRoutingModule {}
