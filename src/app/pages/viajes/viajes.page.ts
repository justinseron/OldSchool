import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireviajesService } from 'src/app/services/fireviajes.service';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss'],
})
export class ViajesPage implements OnInit {
  viajes: any[] = []; // Lista completa de viajes
  destinosFiltrados: any[] = []; // Viajes filtrados
  misViajes: any[] = []; // Viajes en curso
  viajesDisponibles: any[] = []; // Viajes pendientes

  isBasicoSelected: boolean = true; // Control del segmento de selección
  usuarioRut: string = ''; // Almacenar el RUT del usuario

  constructor(private router: Router, private fireViajesService: FireviajesService) {}

  async ngOnInit() {
    this.usuarioRut = localStorage.getItem("userRut") || ''; // Obtiene el RUT del usuario
    await this.cargarViajes();
  }

  async cargarViajes() {
    const todosLosViajes = await this.fireViajesService.getViajes(); // Obtener todos los viajes
    console.log("Todos los viajes desde el almacenamiento:", todosLosViajes); // Log para depuración

    // Filtrar viajes disponibles
    this.viajesDisponibles = todosLosViajes.filter(viaje => 
        viaje.estado_viaje === 'pendiente' && // Solo los viajes pendientes
        !(viaje.pasajeros && viaje.pasajeros.includes(this.usuarioRut)) // Excluir los que ya tomó el usuario
    );

    // Filtrar los viajes que el usuario ya ha tomado
    this.misViajes = todosLosViajes.filter(viaje => 
        viaje.pasajeros && viaje.pasajeros.includes(this.usuarioRut) // Incluye los viajes del usuario
    );

    console.log("Talleres Disponibles:", this.viajesDisponibles); // Log para verificar
    console.log("Mis Talleres:", this.misViajes); // Log para verificar
  }

  filtrarViajes() {
    if (this.isBasicoSelected) {
      // Mostrar solo los viajes en curso
      this.destinosFiltrados = this.misViajes.filter(viaje => viaje.estado_viaje === 'en_curso');
    } else {
      // Mostrar solo los viajes pendientes
      this.destinosFiltrados = this.viajesDisponibles;
    }
    console.log("Talleres filtrados:", this.destinosFiltrados); // Verifica los destinos filtrados
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.destinosFiltrados = this.viajes.filter(viaje => 
      viaje.nombre_destino.toLowerCase().includes(query) &&
      viaje.estado_viaje !== 'en_curso' // Excluir viajes en curso
    );
  }

  async tomarViaje(viaje: any) {
    const exito = await this.fireViajesService.tomarViaje(viaje.id__viaje, this.usuarioRut);
    if (exito) {
      await this.cargarViajes(); // Recargar los viajes después de tomar uno
      console.log("Taller tomado con éxito");
    } else {
      console.log("No se puede tomar el taller.");
      alert("No se puede tomar el taller.");
    }
  }

  ver(viaje: any) {
    console.log('Taller:', viaje); // Agrega este log para verificar el objeto completo
    const viajeId = viaje.id || viaje.id__viaje; // Verifica si tiene el ID
    if (!viajeId) {
      console.error('El ID del taller no está definido:', viaje);
      return; // Salir si el ID no está definido
    }

    console.log('ID del taller:', viajeId); // Verifica el ID del viaje
    this.router.navigate(['/home/viajes/detalles-viaje', viajeId]);
  }

  onSegmentChange(event: any) {
    this.isBasicoSelected = event.detail.value === 'basico';
    this.filtrarViajes();
  }

  onDestinoSelect(destino: string) {
    const tipoViaje = this.isBasicoSelected ? 'BÁSICO' : 'PRIORITY';
    this.router.navigate(['/detalles-viaje'], {
      state: {
        destino: destino,
        tipoViaje: tipoViaje,
      },
    });
  }
}
