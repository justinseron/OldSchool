import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilViajesPageRoutingModule } from './perfil-viajes-routing.module';

import { PerfilViajesPage } from './perfil-viajes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilViajesPageRoutingModule
  ],
  declarations: [PerfilViajesPage]
})
export class PerfilViajesPageModule {}
