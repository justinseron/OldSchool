import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VistaAdminPageRoutingModule } from './vista-admin-routing.module';

import { VistaAdminPage } from './vista-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VistaAdminPageRoutingModule
  ],
  declarations: [VistaAdminPage]
})
export class VistaAdminPageModule {}
