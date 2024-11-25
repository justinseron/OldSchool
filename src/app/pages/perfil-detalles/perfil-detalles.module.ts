import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilDetallesPageRoutingModule } from './perfil-detalles-routing.module';

import { PerfilDetallesPage } from './perfil-detalles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilDetallesPageRoutingModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [PerfilDetallesPage]
})
export class PerfilDetallesPageModule {}
