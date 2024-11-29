import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import * as G from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { FireUsuarioService } from 'src/app/services/fireusuario.service';
import { FireviajesService } from 'src/app/services/fireviajes.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-administrar-viajes',
  templateUrl: './administrar-viajes.page.html',
  styleUrls: ['./administrar-viajes.page.scss'],
})
export class AdministrarViajesPage implements OnInit {
  viaje: FormGroup;
  viajes: any[] = [];
  usuarios: any[] = [];
  conductores: any[] = [];
  botonModificar: boolean = true;
  private map: L.Map | undefined;
  private geocoder: G.Geocoder | undefined;
  private routingControl: L.Routing.Control | undefined;
  private currentMarker: L.Marker | undefined;
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = '';
  distancia_metros: number = 0;
  tiempo_segundos: number = 0;

  constructor(
    private alertController: AlertController,
    private fireViajesService: FireviajesService,
    private fireUsuarioService: FireUsuarioService,
    private router: Router,
    private loadingController: LoadingController
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.resetMap();
      }
    });

    // Inicializa el formulario aquí para una mejor legibilidad
    this.viaje = new FormGroup({
      id__viaje: new FormControl({ value: '', disabled: true }), // Campo solo lectura
      conductor: new FormControl('',[Validators.required]),
      rut:new FormControl('',[]),
      nombre_destino: new FormControl('', [Validators.required]),
      estado_viaje: new FormControl('pendiente', []),
    });
    this.loadViajes();
    this.cargarConductores();
    this.initMap();
  }

  async ngOnInit() {
    this.initMap();
    await this.cargarConductores();
    this.cargarViajes(); // Cargar los viajes en ngOnInit
    

    this.fireUsuarioService.usuarios$.subscribe((usuarios) => {
      this.conductores = usuarios.filter(
        (usuario) => usuario.tipo_usuario === 'Conductor'
      );
      console.log(this.conductores);
    });
    this.viajes = await this.fireViajesService.getViajes();
    this.fireUsuarioService.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios;
    });
  }
  async mostrarCargando() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent',  // Puedes cambiar el tipo de spinner aquí
      duration: 10000,      // Duración opcional, si quieres que se cierre después de cierto tiempo
    });
    await loading.present();
    return loading;
  }
  onConductorChange(event: any) {
    const conductorSeleccionado = event.detail.value; // Obtiene el objeto del conductor
    console.log(conductorSeleccionado); 
    if (conductorSeleccionado) {
      // Asignar las propiedades del conductor al formulario
      this.viaje.patchValue({
        conductor: conductorSeleccionado.nombre, // Asigna el nombre al campo solo lectura
        patente: conductorSeleccionado.patente_auto,
        color_auto: conductorSeleccionado.color_auto,
        asientos_disponibles: conductorSeleccionado.asientos_disponibles,
        rut: conductorSeleccionado.rut,
      });
    } 
  }

  private mostrarRuta(origenLat: number, origenLng: number, destinoLat: number, destinoLng: number) {
    this.resetMap(); // Limpia el mapa antes de dibujar la nueva ruta
  
    // Agregar la ruta desde el origen al destino
    if (this.map) {
      this.routingControl = L.Routing.control({
        waypoints: [
          L.latLng(origenLat, origenLng),
          L.latLng(destinoLat, destinoLng)
        ],
        fitSelectedRoutes: true
      }).on('routesfound', (e) => {
        this.distancia_metros = e.routes[0].summary.totalDistance;
        this.tiempo_segundos = e.routes[0].summary.totalTime;
        
      }).addTo(this.map);
    }
  }

  async cargarConductores() {
    this.conductores = await this.fireUsuarioService.getConductores();
  }
  

  async loadViajes() {
    this.viajes = await this.fireViajesService.getViajes();
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });

    await alert.present();
  }

  onPaymentMethodChange(event: any) {
    // Puedes agregar más lógica aquí si es necesario
  }

  isCardPayment(): boolean {
    return this.viaje.get('metodo_pago')?.value === 'tarjeta';
  }

  limpiar() {
    this.viaje.reset(); // Restablece todos los controles del formulario
    this.botonModificar = true; // Restablece el botón de modificar
    this.viaje.get('id__viaje')?.disable(); // Deshabilita el campo de ID
    this.viaje.get('conductor')?.setValue(null);
    const conductorSelect = document.querySelector('ion-select') as HTMLIonSelectElement | null;
    if (conductorSelect) {
      conductorSelect.value = null; // Limpiar el valor del ion-select
    }
    this.resetMap()
  }
  async onSubmit() {
    const loading = await this.mostrarCargando();
    if (this.viaje.valid) {
      const nuevoViaje = { ...this.viaje.value };
      delete nuevoViaje.id__viaje;  // Elimina el ID si es necesario para crear el viaje
      const viajeCreado = await this.fireViajesService.createViaje(nuevoViaje);
      if (viajeCreado) {
        this.viajes = await this.fireViajesService.getViajes();
        loading.dismiss();
        await this.mostrarAlerta('Éxito', 'Viaje creado con éxito!');
        this.limpiar();  // Limpia el formulario después de crear el viaje
      } else {
        await this.mostrarAlerta('Error', 'ERROR! Viaje no creado');
      }
    }
  }

  async buscar(id__viaje: string) {
    const loading = await this.mostrarCargando();
    loading.dismiss();
    console.log('Buscando viaje con ID de Firebase:', id__viaje);
  
    const viajeData = await this.fireViajesService.getViaje(id__viaje);
    if (viajeData) {
      this.viaje.patchValue({
        ...viajeData,
        conductor: viajeData.conductor,
      });
      this.botonModificar = false;
  
      // Verifica las coordenadas antes de llamar a mostrarRuta
      const origenLat = -33.598246116458384; // Coordenadas de origen
      const origenLng = -70.5788192627744;
  
      // Dibuja el círculo en el destino
      if (this.map) {
        this.resetMap(); // Limpiar el mapa antes de dibujar un nuevo elemento
  
        // Dibuja el círculo en las coordenadas del destino del viaje
        const destinoLat = viajeData.latitud;
        const destinoLng = viajeData.longitud;
        
        var circulo = L.circle([destinoLat, destinoLng], {
          color: 'blue', // Color del borde del círculo
          fillColor: '#007bff', // Color de relleno azul
          fillOpacity: 0.5,
          radius: 500
        }).addTo(this.map); 
  
        // Dibuja la ruta desde el origen hasta el destino
        this.mostrarRuta(origenLat, origenLng, destinoLat, destinoLng);
      }
    } else {
      await this.mostrarAlerta('Error', 'Viaje no encontrado.');
    }
  }
  
  
  

  
  
  
  
  async modificar() {
    const loading = await this.mostrarCargando();
    const idViaje = this.viaje.get('id__viaje')?.value;
    if (idViaje) {
      try {
        await this.fireViajesService.updateViaje(idViaje, this.viaje.value);
        this.viajes = await this.fireViajesService.getViajes();
        loading.dismiss();
        await this.mostrarAlerta('Éxito', '¡Viaje modificado con éxito!');
        this.botonModificar = true;
        this.limpiar();
      } catch (error) {
        await this.mostrarAlerta('Error', '¡Error! Viaje no modificado.');
      }
    } else {
      await this.mostrarAlerta('Error', 'Por favor, proporciona un ID de viaje válido.');
    }
  }
  


  async eliminar(id__viaje: string) {
    // Primero, solo muestra la alerta de confirmación
    const confirmacion = await this.presentConfirmAlert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar este Viaje?',
      async () => {
        // Ahora que el usuario ha confirmado, muestra el cargando
        const loading = await this.mostrarCargando();
        
        try {
          const result = await this.fireViajesService.deleteViaje(id__viaje);
          if (result) {
            this.viajes = await this.fireViajesService.getViajes();
            this.limpiar();
            this.resetMap();
            loading.dismiss();  // Cierra el loading después de la eliminación
            await this.mostrarAlerta('Éxito', '¡Viaje eliminado con éxito!');
          } else {
            throw new Error('Error en la eliminación del viaje');
          }
        } catch (error) {
          loading.dismiss();  // Asegúrate de cerrar el loading en caso de error también
          await this.mostrarAlerta('Error', '¡Error! Viaje no eliminado.');
        }
      }
    );
  }

  private async presentConfirmAlert(titulo: string, mensaje: string, callback: () => Promise<void>) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: callback,
        },
      ],
    });
  
    await alert.present();
  }
  async cargarViajes() {
    this.viajes = await this.fireViajesService.getViajes();
    console.log(this.viajes);  // Verifica si los viajes tienen los ID correctos
  }

  ver(viaje: any) {
    this.router.navigate(['/detalles-viaje'], {
      state: { viaje: viaje },
    });
  }


  //mapita

  initMap() { try{
    const initialLat = -33.598246116458384;
    const initialLng = -70.5788192627744;
    // Inicializar el mapa con las coordenadas predeterminadas
    this.map = L.map("map_html").locate({setView:true, maxZoom:16});

    // Cargar los tiles de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Agregar geocoder
    this.geocoder = G.geocoder({
      placeholder: "Ingrese dirección a buscar",
      errorMessage: "Direccion no encontrada"
    }).addTo(this.map);
    this.map.on('locationfound', (e)=>{
      console.log(e.latlng.lat);
      console.log(e.latlng.lng); //poner en numeros de abajo,primero guardar en variables (ubicacion actual)
    });

    // Escuchar eventos del geocoder
    this.geocoder.on('markgeocode', (e) => {
      this.latitud = e.geocode.properties['lat'];
      this.longitud= e.geocode.properties['lon'];
      this.direccion = e.geocode.properties['display_name'];
      this.resetMap();

      var circulo = L.circle([this.latitud, this.longitud], {
        color: 'blue', // Color del borde del círculo
        fillColor: '#007bff', // Color de relleno azul
        fillOpacity: 0.5,
        radius: 500
      }).addTo(this.map!);

      // Agregar ruta desde la ubicación predeterminada a la nueva ubicación seleccionada
      if (this.map) {
        this.routingControl = L.Routing.control({
          waypoints: [
            L.latLng(initialLat, initialLng),
            L.latLng(this.latitud, this.longitud)
          ],
          
          fitSelectedRoutes: true
        }).on('routesfound', (e) => {
          this.distancia_metros = e.routes[0].summary.totalDistance;
          this.tiempo_segundos = e.routes[0].summary.totalTime; 
        }).addTo(this.map);
      }
    });
  
  } catch (error) {
  }}

  private resetMap() {
    if (this.map) {
      // Elimina todos los marcadores y círculos solo si el mapa está definido
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          this.map!.removeLayer(layer); // Asegúrate de usar el operador de aserción no nulo
        }
      });
  
      // Elimina el control de rutas si existe
      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
        this.routingControl = undefined;  
      }
    }}
  
}
