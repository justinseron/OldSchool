import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FireviajesService } from 'src/app/services/fireviajes.service';
import * as L from 'leaflet';  // Importar Leaflet

@Component({
  selector: 'app-detalles-viaje',
  templateUrl: './detalles-viaje.page.html',
  styleUrls: ['./detalles-viaje.page.scss'],
})
export class DetallesViajePage implements OnInit {
  id: string = "";
  usuarioRut: string = "";
  viaje: any;
  latitud: number = 0;
  longitud: number = 0;
  map: any;
  viajeTomado: boolean = false;
  duracionViajeMinutos: number = 0;
  
  // Coordenadas del origen: Duoc UC Puente Alto
  origenLat: number = -33.618005; 
  origenLng: number = -70.590955;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private fireViajesService: FireviajesService,
    private usuarioService: UsuarioService
  ) {}

  async ngOnInit() {
    this.usuarioRut = localStorage.getItem("userRut") || '';
  
    this.activatedRoute.paramMap.subscribe(async (params) => {
      this.id = params.get('id') || "";
  
      if (this.id) {
        await this.loadViaje(this.id);
        setTimeout(() => {
          this.initializeMap();  // Asegúrate de que el mapa se inicialice tras la carga del viaje
        }, 100);  // Espera 100 ms para que el contenedor del mapa esté disponible
      } else {
        console.error("ID de taller no proporcionado.");
      }
    });
  }

  async loadViaje(id: string) {
    this.viaje = await this.fireViajesService.getViaje(id);
    if (this.viaje) {
      this.latitud = this.viaje.latitud;  // Obtener latitud del viaje
      this.longitud = this.viaje.longitud;  // Obtener longitud del viaje
      this.viajeTomado = this.viaje.pasajeros?.includes(this.usuarioRut) || false;
      this.duracionViajeMinutos = Math.floor(this.viaje.duracion_viaje / 60); // Asumiendo que está en segundos
    } else {
      console.error("No se pudo cargar el taller.");
    }
  }

  initializeMap() {
    const initialLat = -33.598246116458384; // Coordenadas iniciales
    const initialLng = -70.5788192627744;

    if (this.map) {
        this.map.remove(); // Remover el mapa si ya existe
    }

    this.map = L.map('map').setView([initialLat, initialLng], 13);  // Vista inicial en las coordenadas específicas

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(this.map);

    // Crear íconos de marcadores
    const startIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const endIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: '',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    
    // Marcador de inicio en las coordenadas iniciales
    L.marker([initialLat, initialLng], { icon: startIcon })
        .addTo(this.map)
        .bindPopup('Inicio de ruta')
        .openPopup();

    // Marcador de destino
    if (this.latitud && this.longitud) {
        L.marker([this.latitud, this.longitud], { icon: endIcon })
            .addTo(this.map)
            .bindPopup(`Destino: ${this.viaje.nombre_destino}`)
            .openPopup();
        
        // Dibujar la ruta desde las coordenadas iniciales al destino
        L.Routing.control({
            waypoints: [
                L.latLng(initialLat, initialLng),  // Coordenadas iniciales
                L.latLng(this.latitud, this.longitud)  // Coordenadas de destino
            ],
            routeWhileDragging: false,
            lineOptions: {
                styles: [{ color: 'blue', weight: 4 }],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
        }).addTo(this.map);
        
        // Círculo en el destino
        L.circle([this.latitud, this.longitud], {
            color: 'green',
            fillColor: '#00FF00',
            fillOpacity: 0.5,
            radius: 250
        }).addTo(this.map);
    } else {
        console.error("Coordenadas de destino no válidas.");
    }

    setTimeout(() => {
        this.map.invalidateSize();  // Ajusta el tamaño del mapa correctamente
    }, 0);
}




  volver() {
    this.router.navigate(['/home/viajes']);
  }

  async confirmarTomaViaje() {
    if (this.viaje) {
      // Verifica si el usuario ya tiene un viaje tomado
      if (this.viajeTomado) {
        const alert = await this.alertController.create({
          header: 'Taller en Curso',
          message: `Ya tienes un taller en curso. ¿Quieres cancelarlo para tomar el nuevo taller ${this.viaje.nombre_destino}?`,
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Sí',
              handler: async () => {
                // Cancelar el viaje anterior
                const exitoCancelacion = await this.fireViajesService.cancelarViaje(this.viaje.id__viaje, this.usuarioRut);
                if (exitoCancelacion) {
                  await this.tomarNuevoViaje(); // Permitir al usuario tomar el nuevo viaje
                } else {
                  this.mostrarAlerta('Error', 'No se pudo cancelar el taller anterior.');
                }
              }
            }
          ]
        });

        await alert.present();
      } else {
        // Si no tiene un viaje anterior, solo procede a tomar el nuevo viaje
        await this.tomarNuevoViaje();
      }
    }
  }

  async tomarNuevoViaje() {
    const alert = await this.alertController.create({
      header: 'Confirmar Toma de Taller',
      message: `¿Estás seguro de que quieres tomar el taller ${this.viaje.nombre_destino}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const exito = await this.fireViajesService.tomarViaje(this.viaje.id__viaje, this.usuarioRut);
            if (exito) {
              this.viajeTomado = true;
              this.router.navigate(['/home/viajes']); // Redirigir a "Mis viajes"
            } else {
              this.mostrarAlerta('', 'Taller no tomado.');
              this.router.navigate(['/home/viajes']);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelarViaje() {
    if (this.viajeTomado) {
      const alert = await this.alertController.create({
        header: 'Confirmar Cancelación',
        message: `¿Estás seguro de que quieres cancelar el taller a ${this.viaje.nombre_destino}?`,
        buttons: [
          {
            text: 'No, regresar',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Sí, cancelar',
            handler: async () => {
              const exito = await this.fireViajesService.cancelarViaje(this.viaje.id__viaje, this.usuarioRut);
              if (exito) {
                this.viajeTomado = false;
                this.router.navigate(['/home/viajes']); // Redirigir a "Mis viajes"
              } else {
                this.mostrarAlerta('Error', 'No se puede cancelar el taller.');
              }
            }
          }
        ]
      });
  
      await alert.present();
    } else {
      this.mostrarAlerta('Sin Taller en Curso', 'No tienes un taller en curso que cancelar.');
    }
  }
  
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
        header,
        message,
        buttons: ['Aceptar']
    });
    await alert.present();
  }

  isButtonDisabled(): boolean {
    if (!this.viaje) return true; // Si no hay viaje, deshabilitar
    
    const pasajeros = this.viaje.pasajeros || []; // Asegúrate de que pasajeros sea un arreglo
    const isTaken = pasajeros.includes(this.usuarioRut); // Verifica si el usuario ya ha tomado el viaje
    const isPending = this.viaje.estado_viaje === 'pendiente'; // Verifica si el estado es pendiente

    return isTaken || !isPending;
  }
}
