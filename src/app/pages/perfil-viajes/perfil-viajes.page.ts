import { Component, OnInit } from '@angular/core';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-perfil-viajes',
  templateUrl: './perfil-viajes.page.html',
  styleUrls: ['./perfil-viajes.page.scss'],
})
export class PerfilViajesPage implements OnInit {
  viajesTerminados: any[] = [];

  constructor(private viajesService: ViajesService) { }

  ngOnInit() {
    this.cargarViajesTerminados();  
  }

  async cargarViajesTerminados() {
    const todosLosViajes = await this.viajesService.getViajes(); // Obtener todos los viajes
    this.viajesTerminados = todosLosViajes.filter((viaje: any) => viaje.estado_viaje === 'terminado'); // Filtrar los viajes terminados
  }

}
