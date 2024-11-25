import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificarCodigoPageRoutingModule } from './verificar-codigo-routing.module';

import { VerificarCodigoPage } from './verificar-codigo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificarCodigoPageRoutingModule
  ],
  declarations: [VerificarCodigoPage]
})
export class VerificarCodigoPageModule {}
