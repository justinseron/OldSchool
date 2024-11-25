import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesViajePageRoutingModule } from './detalles-viaje-routing.module';

import { DetallesViajePage } from './detalles-viaje.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesViajePageRoutingModule
  ],
  declarations: [DetallesViajePage]
})
export class DetallesViajePageModule {}
