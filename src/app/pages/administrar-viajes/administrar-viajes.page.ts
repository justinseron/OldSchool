  import { Component, OnInit } from '@angular/core';
  import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
  import { NavigationStart, Router } from '@angular/router';
  import { AlertController } from '@ionic/angular';
  import { ViajesService } from 'src/app/services/viajes.service';
  import { UsuarioService } from 'src/app/services/usuario.service';
  import * as L from 'leaflet';
  import * as G from 'leaflet-control-geocoder';
  import 'leaflet-routing-machine';

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
      private viajeService: ViajesService,
      private usuarioService: UsuarioService,
      private alertController: AlertController,
      private router: Router
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
        patente: new FormControl('',[ Validators.pattern("^[A-Z0-9.-]*$"),Validators.maxLength(8)]),
        color_auto: new FormControl('', [Validators.required]),//*
        asientos_disponibles: new FormControl('', [
          Validators.min(2),  // Mayor a 1
          Validators.max(6),  // Menor a 7
          Validators.required  // Campo requerido si el usuario tiene auto
        ]),
        nombre_destino: new FormControl('', [Validators.required]),
        latitud: new FormControl('', [Validators.required]),
        longitud: new FormControl('', [Validators.required]),
        distancia_metros: new FormControl('', [Validators.required]),
        costo_viaje: new FormControl('',[Validators.min(0), Validators.required]),
        metodo_pago: new FormControl('efectivo', [Validators.required]),
        numero_tarjeta:  new FormControl('',[Validators.min(0)]),
        duracion_viaje: new FormControl('', [Validators.required]),
        hora_salida: new FormControl('', [Validators.required]),
        pasajeros: new FormControl('',[]),
        estado_viaje: new FormControl('pendiente', []),
      });
      this.loadViajes();
      this.cargarConductores();
    }

    async ngOnInit() {
      this.initMap();
      await this.cargarConductores();
      this.cargarViajes(); // Cargar los viajes en ngOnInit

      this.usuarioService.usuarios$.subscribe((usuarios) => {
        this.conductores = usuarios.filter(
          (usuario) => usuario.tipo_usuario === 'Conductor'
        );
        console.log(this.conductores);
      });
      this.viajes = await this.viajeService.getViajes();
      this.usuarios = await this.usuarioService.getUsuarios();
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
      this.conductores = await this.usuarioService.getConductores();
    }
    

    async loadViajes() {
      this.viajes = await this.viajeService.getViajes();
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
    }
    async onSubmit() {
      if (this.viaje.valid) {
        const nuevoViaje = { ...this.viaje.value };
        delete nuevoViaje.id__viaje; // Eliminar el ID si es necesario para crear el viaje
        if (await this.viajeService.createViaje(nuevoViaje)) {
          this.viajes = await this.viajeService.getViajes();
          await this.mostrarAlerta('Éxito', 'Viaje creado con éxito!');
          this.limpiar(); // Limpia el formulario después de crear el viaje
        } else {
          await this.mostrarAlerta('Error', 'ERROR! Viaje no creado');
        }
      } else {
        await this.mostrarAlerta('Error', 'Por favor, completa todos los campos requeridos.');
      }
    }

    async buscar(id__viaje: number) {
      const viajeData = await this.viajeService.getViaje(id__viaje);
      if (viajeData) {
        this.viaje.patchValue({
          ...viajeData,
          conductor: viajeData.conductor?.nombre
        });
        this.botonModificar = false;
    
        // Aquí podrías definir la ubicación de origen, 
        // supongamos que es una ubicación fija, como las coordenadas iniciales
        const origenLat = -33.598246116458384; // Coordenadas de origen
        const origenLng = -70.5788192627744;
    
        // Llama a un método para mostrar la ruta
        this.mostrarRuta(origenLat, origenLng, viajeData.latitud, viajeData.longitud);
      } else {
        await this.mostrarAlerta('Error', 'Viaje no encontrado.');
      }
    }

    async modificar() {
      const buscar_viaje: number = this.viaje.get('id__viaje')?.value;

      if (buscar_viaje) {
          try {
              await this.viajeService.updateViaje(buscar_viaje, this.viaje.value);
              this.viajes = await this.viajeService.getViajes();
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


    async eliminar(viaje_eliminar: number) {
      const confirmacion = await this.presentConfirmAlert(
        'Confirmar Eliminación',
        '¿Estás seguro de que deseas eliminar este Viaje?',
        async () => {
          try {
            const result = await this.viajeService.deleteViaje(viaje_eliminar);
            if (result) {
              this.viajes = await this.viajeService.getViajes();
              this.limpiar();
              this.resetMap();
              await this.mostrarAlerta('Éxito', '¡Viaje eliminado con éxito!');
            } else {
              throw new Error('Error en la eliminación del viaje');
            }
          } catch (error) {
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
      this.viajes = await this.viajeService.getViajes();
      console.log(this.viajes);
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
