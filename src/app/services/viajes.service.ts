import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {
  private misViajesKey = "mis_viajes";
  private viajesDisponibles: any[] = []; // Array de viajes disponibles
  private misViajes: any[] = []; // Array de "Mis viajes"

  constructor(private storage: Storage,private usuarioService: UsuarioService) { 
    this.init();
  }

  async init() {
    await this.storage.create();
    let viajes: any[] = await this.storage.get("viajes") || [];

    // Solo crea viajes nuevos si no hay ninguno en el almacenamiento
    if (viajes.length === 0) {
      let nuevosViajes = [
          {
              "id__taller": "1",
              "conductor": "Juan Pérez",
              "rut": "8208490-8",
              "nombre_destino": "Municipalidad de Puente Alto, 1820, Avenida Concha y Toro",
              "latitud": -33.59523505,
              "longitud": -70.57963843136085,
              "distancia_metros": 1939.2,
              "costo_viaje": 2000,
              "metodo_pago": "efectivo",
              "numero_tarjeta": "",
              "duracion_viaje": 150,
              "hora_salida": "13:00",
              "pasajeros": [],
              "estado_viaje": "pendiente",
          },
          {
              "id__viaje": "2",
              "conductor": "Juan Pérez",
              "rut": "8208490-8",
              "patente": "BCDE44",
              "color_auto": "Azul",
              "asientos_disponibles": 3,
              "nombre_destino": "Metro Protectora de la Infancia, Puente Alto",
              "latitud": -33.592333,
              "longitud": -70.584442,
              "distancia_metros": 800,
              "costo_viaje": 2000,
              "metodo_pago": "tarjeta",
              "numero_tarjeta": "1234567812345678",
              "duracion_viaje": 180,
              "hora_salida": "12:30",
              "pasajeros": [],
              "estado_viaje": "pendiente",
          },
          {
              "id__viaje": "3",
              "conductor": "María López",
              "rut": "20792607-8",
              "patente": "QWER66",
              "color_auto": "Negro",
              "asientos_disponibles": 1,
              "nombre_destino": "Plaza de Puente Alto",
              "latitud": -33.610104,
              "longitud": -70.575749,
              "distancia_metros": 2500,
              "costo_viaje": 2000,
              "metodo_pago": "efectivo",
              "numero_tarjeta": "",
              "duracion_viaje": 150,
              "hora_salida": "14:00",
              "pasajeros": [],
              "estado_viaje": "pendiente",
          },
          {
              "id__viaje": "4",
              "conductor": "María López",
              "rut": "20792607-8",
              "patente": "XZGT89",
              "color_auto": "Blanco",
              "asientos_disponibles": 4,
              "nombre_destino": "Hospital Sótero del Río",
              "latitud": -33.584539,
              "longitud": -70.564979,
              "distancia_metros": 3000,
              "costo_viaje": 4000,
              "metodo_pago": "tarjeta",
              "numero_tarjeta": "8765432187654321",
              "duracion_viaje": 300,
              "hora_salida": "12:00",
              "pasajeros": [],
              "estado_viaje": "pendiente",
          },
          {
            "id__taller": "5",
            "conductor": "Juan Pérez",
            "rut": "8208490-8",
            "nombre_destino": "Manualidades peneales",
            "hora_salida": "13:00",
            "pasajeros": [],
            "estado_viaje": "pendiente",
          },
      ];
      for (let viaje of nuevosViajes) {
          await this.createViaje(viaje);
      }
  }

  this.viajesDisponibles = viajes.filter(viaje => viaje.estado_viaje === 'pendiente');
}
  async tieneViajeVinculado(rutPasajero: string): Promise<boolean> {
  const viajes = await this.getViajes(); // Obtener todos los viajes
  return viajes.some(viaje => viaje.pasajeros.includes(rutPasajero));
}
public async getViajesPorConductor(rutConductor: string): Promise<any[]> {
  const viajes: any[] = await this.storage.get("viajes") || [];
  console.log('Viajes disponibles:', viajes); // Log para verificar los viajes
  const viajesFiltrados = viajes.filter(viaje => viaje.rut === rutConductor);
  console.log('Viajes del conductor:', viajesFiltrados); // Log para verificar los viajes filtrados
  return viajesFiltrados;
}

public async createViaje(viaje: any): Promise<boolean> {
  try {
    let viajes: any[] = await this.storage.get("viajes") || [];
    
    if (!viaje.id__viaje) {
      viaje.id__viaje = (viajes.length > 0 ? (parseInt(viajes[viajes.length - 1].id__viaje) + 1).toString() : "1");
    }

    viaje.pasajeros = viaje.pasajeros || []; // Asegúrate de inicializar pasajeros

    if (viajes.find(v => v.id__viaje === viaje.id__viaje) !== undefined) {
      return false; // Viaje ya existe
    }

    viajes.push(viaje);
    await this.storage.set("viajes", viajes);
    return true;
  } catch (error) {
    console.error('Error al crear el viaje:', error);
    return false;
  }
}

  public async getViaje(id: number): Promise<any> {
    const viajes = await this.getViajes(); // Obtener todos los viajes
    return viajes.find(viaje => viaje.id__viaje === id.toString()); // Comparar como string
  }



  public async getViajes(): Promise<any[]> {
    const viajes = await this.storage.get('viajes'); // Obtener viajes desde el almacenamiento
    console.log("Todos los viajes desde el servicio:", viajes); // Log para depuración
    return viajes || [];
  }

  async tomarViaje(idViaje: number, usuarioRut: string): Promise<boolean> {
    // Verifica si el usuario ya tiene un viaje activo
    const tieneViajeEnCurso = await this.tieneViajeVinculado(usuarioRut);
    
    if (tieneViajeEnCurso) {
        const confirmCancel = confirm("Ya tienes un viaje activo. ¿Deseas cancelarlo para tomar este nuevo viaje?");
        if (!confirmCancel) {
            return false; // No se toma el nuevo viaje
        }
        
        // Si el usuario decide cancelar, cancela el viaje activo
        const viajeActivo = await this.getViajes().then(viajes => viajes.find(v => v.pasajeros.includes(usuarioRut)));
        if (viajeActivo) {
            await this.cancelarViaje(parseInt(viajeActivo.id__viaje), usuarioRut);
        }
    }
    const viajes = await this.getViajes();
    const viajeIndex = viajes.findIndex(viaje => viaje.id__viaje === idViaje.toString());
  
    if (viajeIndex !== -1) {
        const viajeTomado = viajes[viajeIndex];
        viajeTomado.pasajeros = viajeTomado.pasajeros || []; // Asegúrate de que sea un arreglo

        // Comprobar si el usuario ya ha tomado el viaje
        if (viajeTomado.pasajeros.includes(usuarioRut)) {
            return false; // El usuario ya tomó este viaje
        }

        // Si el viaje tiene asientos disponibles
        if (viajeTomado.asientos_disponibles > 0) {
            viajeTomado.pasajeros.push(usuarioRut); // Añadir al pasajero
            viajeTomado.asientos_disponibles -= 1; // Disminuir asientos disponibles

            // Cambiar el estado a "en curso" si no hay asientos disponibles
            if (viajeTomado.asientos_disponibles === 0) {
                viajeTomado.estado_viaje = "pendiente"; // Cambiar estado si no hay asientos
            } 
          
            // Actualizar la lista de viajes en el almacenamiento
            await this.updateViaje(viajeTomado.id__viaje, viajeTomado);

            // Mover el viaje a "Mis viajes" si no existe
            if (!this.misViajes.find(v => v.id__viaje === viajeTomado.id__viaje)) {
                this.misViajes.push(viajeTomado);
            }

            // Eliminar de "Viajes disponibles"
            this.viajesDisponibles = this.viajesDisponibles.filter(v => v.id__viaje !== viajeTomado.id__viaje);

            return true; // Retornar éxito
        }
    }
    return false; // No se pudo tomar el viaje
}


  

  
async cancelarViaje(idViaje: number, usuarioRut: string): Promise<boolean> {
  const viajes = await this.getViajes();
  const viajeIndex = viajes.findIndex(viaje => viaje.id__viaje === idViaje.toString());

  if (viajeIndex !== -1) {
      const viaje = viajes[viajeIndex];
      const pasajerosIndex = viaje.pasajeros.indexOf(usuarioRut);
      
      if (pasajerosIndex !== -1) {
          viaje.pasajeros.splice(pasajerosIndex, 1); // Elimina el RUT del pasajero
          viaje.asientos_disponibles += 1; // Aumenta los asientos disponibles

          // Actualiza la lista de viajes en el almacenamiento
          await this.updateViaje(viaje.id__viaje, viaje);
          return true; // Retorna éxito
      }
  }
  return false; // No se pudo cancelar el viaje
}


  public async updateViaje(id__viaje: number, nuevoViaje: any): Promise<boolean> {
    let viajes: any[] = await this.storage.get("viajes") || [];
    let indice: number = viajes.findIndex(viaje => viaje.id__viaje === id__viaje.toString());
    
    if (indice === -1) {
      return false; // Viaje no encontrado
    }

    // No modificar el id__viaje, solo actualizar el resto de las propiedades
    nuevoViaje.id__viaje = viajes[indice].id__viaje; // Mantener el ID original
    viajes[indice] = nuevoViaje;
    await this.storage.set("viajes", viajes);
    return true;
  }

  public async deleteViaje(id__viaje: number): Promise<boolean> {
    let viajes: any[] = await this.storage.get("viajes") || [];
    let indice: number = viajes.findIndex(viaje => viaje.id__viaje === id__viaje.toString());

    if (indice === -1) {
      return false; // Viaje no encontrado
    }

    viajes.splice(indice, 1);
    await this.storage.set("viajes", viajes);
    return true;
  }

  getMisViajes(usuarioRut: string) {
    return this.misViajes.filter(viaje => Array.isArray(viaje.pasajeros) && viaje.pasajeros.includes(usuarioRut));
}


  getViajesDisponibles() {
    return this.viajesDisponibles; // Devolver viajes disponibles
  }

  async obtenerViajesPorConductor(): Promise<any> {
    const rutConductor = this.usuarioService.getRUTLogueado(); // Obtiene el RUT del conductor logueado
    const viajes = await this.getViajes(); // Obtén todos los viajes

    // Filtra los viajes para que solo se muestren los del conductor logueado
    return viajes.filter(viaje => viaje.rut === rutConductor);
}

  
}
