import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-vista-admin',
  templateUrl: './vista-admin.page.html',
  styleUrls: ['./vista-admin.page.scss'],
})
export class VistaAdminPage implements OnInit {
  viajesDelConductor: any[] = []; // Inicializa como un array vacío
  nombresPasajeros: { [rut: string]: string | null } = {}; 

  constructor(private viajeService: ViajesService, private usuarioService: UsuarioService) {}

  async ngOnInit() {
    this.viajesDelConductor = await this.viajeService.obtenerViajesPorConductor();
    await this.cargarNombresPasajeros();
  }
  private async cargarNombresPasajeros() {
    for (const viaje of this.viajesDelConductor) {
      for (const rut of viaje.pasajeros) {
        if (!this.nombresPasajeros[rut]) { // Evita duplicados
          this.nombresPasajeros[rut] = await this.usuarioService.getNombrePorRut(rut);
        }
      }
    }
  }
}



