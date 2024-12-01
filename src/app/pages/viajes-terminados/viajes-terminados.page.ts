import { Component, OnInit } from '@angular/core';
import { FireviajesService } from 'src/app/services/fireviajes.service';

@Component({
  selector: 'app-viajes-terminados',
  templateUrl: './viajes-terminados.page.html',
  styleUrls: ['./viajes-terminados.page.scss'],
})
export class ViajesTerminadosPage implements OnInit {
  viajesTerminados: any[] = [];

  constructor(private fireViajesService: FireviajesService ) { }

  ngOnInit() {
    this.cargarViajesTerminados();  
  }

  async cargarViajesTerminados() {
    const todosLosViajes = await this.fireViajesService.getViajes(); // Obtener todos los viajes
    this.viajesTerminados = todosLosViajes.filter((viaje: any) => viaje.estado_viaje === 'terminado'); // Filtrar los viajes terminados
  }
}