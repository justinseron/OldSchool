import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViajesTerminadosPageRoutingModule } from './viajes-terminados-routing.module';

import { ViajesTerminadosPage } from './viajes-terminados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViajesTerminadosPageRoutingModule
  ],
  declarations: [ViajesTerminadosPage]
})
export class ViajesTerminadosPageModule {}
