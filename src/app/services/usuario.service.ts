import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private usuariosSubject = new BehaviorSubject<any[]>([]);
  usuarios$ = this.usuariosSubject.asObservable();
  private rutConductorLogueado: string | null = null;
  public setRutConductor(rut: string) {
    this.rutConductorLogueado = rut;
  }


  //Aquí podemos crear variables:
  usuarios: any[] = [
  ];

  constructor(private storage: Storage,private httpClient: HttpClient) {
    this.init();
   }

  async init(){
    await this.storage.create();
    const usuariosGuardados = await this.getUsuarios();
    let admin =   {
      "rut": "20792608-6",
      "nombre": "Administrador",
      "correo": "admin@duocuc.cl",
      "fecha_nacimiento": "2002-03-10",
      "password": "Admin123.",
      "confirm_password": "Admin123.",
      "genero": "otro",
      "tiene_auto": "no",
      "patente_auto": "",
      "marca_auto": "",
      "color_auto": "",
      "asientos_disponibles": "",
      "tipo_usuario": "Administrador"

    };
    await this.createUsuario(admin);
    let conductor1 = {
      "rut": "8208490-8",
      "nombre": "Juan Pérez",
      "correo": "juan@duocuc.cl",
      "fecha_nacimiento": "1980-01-01",
      "password": "Conductor123.",
      "confirm_password": "Conductor123.",
      "genero": "masculino",
      "tiene_auto": "si",
      "patente_auto": "XYZ123",
      "marca_auto": "Ford",
      "color_auto": "Azul",
      "asientos_disponibles": "4",
      "tipo_usuario": "Colaborador"
    };
  
    let conductor2 = {
      "rut": "20792607-8",
      "nombre": "María López",
      "correo": "maria@duocuc.cl",
      "fecha_nacimiento": "1990-02-02",
      "password": "Conductor123.",
      "confirm_password": "Conductor123.",
      "genero": "femenino",
      "tiene_auto": "si",
      "patente_auto": "ABC456",
      "marca_auto": "Chevrolet",
      "color_auto": "Rojo",
      "asientos_disponibles": "4",
      "tipo_usuario": "Colaborador"
    };
    let pasajero1 = {
      "rut": "5995618-3",
      "nombre": "Carlos Rivera",
      "correo": "carlos@duocuc.cl",
      "fecha_nacimiento": "1995-05-05",
      "password": "Pasajero123.",
      "confirm_password": "Pasajero123.",
      "genero": "masculino",
      "tiene_auto": "no",
      "tipo_usuario": "Usuario"
    };

    let pasajero2 = {
      "rut": "17052872-7",
      "nombre": "Ana Torres",
      "correo": "ana@duocuc.cl",
      "fecha_nacimiento": "1997-07-07",
      "password": "Pasajero123.",
      "confirm_password": "Pasajero123.",
      "genero": "femenino",
      "tiene_auto": "no",
      "tipo_usuario": "Usuario"
    };

    if (usuariosGuardados.length === 0) { // Solo agregar si no hay usuarios
      await this.createUsuario(admin);
      await this.createUsuario(conductor1);
      await this.createUsuario(conductor2);
      await this.createUsuario(pasajero1);
      await this.createUsuario(pasajero2);
    }
    this.usuarios = await this.getUsuarios(); // Cargar la lista actualizada
    this.usuariosSubject.next(this.usuarios); // Emitir usuarios al iniciar
  }
  public async getConductores(): Promise<any[]> {
    // Usar la lista actualizada en lugar de cargar de nuevo
    return this.usuarios.filter(usuario => usuario.tipo_usuario === 'Colaborador');
  }
  public getConductorPorNombre(nombre: string): any {
    return this.usuarios.find(usuario => usuario.nombre === nombre && usuario.tipo_usuario === 'Colaborador');
  }
  public async getPasajeros(): Promise<any[]> {
    return this.usuarios.filter(usuario => usuario.tipo_usuario === 'Usuario');
  }
  public getConductorData(nombre: string): Observable<any> {
    return this.httpClient.get<any>(`/api/conductores/${nombre}`);
  }
  public getRutConductor(): string | null {
    return this.getUserRut() || null;
}

  //aquí vamos a crear toda nuestra lógica de programación
  //DAO:
  public async createUsuario(usuario:any): Promise<boolean>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    if(usuarios.find(usu=>usu.rut==usuario.rut)!=undefined){
      return false;
    }
    usuarios.push(usuario);
    await this.storage.set("usuarios",usuarios);
    this.usuariosSubject.next(this.usuarios);
    return true;
  }


  public async getUsuario(rut:string): Promise<any>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios.find(usu=>usu.rut==rut);
  }

  public async getUsuarios(): Promise<any[]>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios;
  }

  public async updateUsuario(rut:string, nuevoUsuario:any): Promise<boolean>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    let indice: number = usuarios.findIndex(usu=>usu.rut==rut);
    if(indice==-1){
      return false;
    }
    usuarios[indice] = nuevoUsuario;
    await this.storage.set("usuarios",usuarios);
    
    this.usuariosSubject.next(usuarios);
    if (rut === this.getRUTLogueado()) {
      localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    }
    return true;
  }

  public async deleteUsuario(rut:string): Promise<boolean>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    let indice: number = usuarios.findIndex(usu=>usu.rut==rut);
    if(indice==-1){
      return false;
    }
    usuarios.splice(indice,1);
    await this.storage.set("usuarios",usuarios);
    this.usuariosSubject.next(usuarios);
    return true;
  }

  public async login(correo: string, contrasena: string): Promise<any> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    const usu = usuarios.find(elemento => elemento.correo == correo && elemento.password == contrasena);
    if (usu) {
        localStorage.setItem("userRut", usu.rut); // Asegúrate de guardar el RUT aquí
        localStorage.setItem("usuario", JSON.stringify(usu)); // Puedes seguir guardando el objeto completo si es necesario
        localStorage.setItem("nombreConductor", usu.nombre);
        return true;
    }
    return false;
}

  getUserRut(): string {
    // Suponiendo que tienes el RUT almacenado en el almacenamiento local
    return localStorage.getItem('userRut') || '';
  }

  getRUTLogueado(): string {
    // Suponiendo que tienes el RUT almacenado en el almacenamiento local
    return localStorage.getItem('userRut') || '';
  }

  public async recuperarUsuario(correo:string): Promise<any>{
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios.find(elemento=> elemento.correo == correo);
  }
  public async getNombrePorRut(rut: string): Promise<string | null> {
    const usuarios = await this.getUsuarios(); // Asume que tienes un método para obtener todos los usuarios
    const usuario = usuarios.find(user => user.rut === rut);
    return usuario ? usuario.nombre : null; // Devuelve el nombre o null si no se encuentra
  }

  public async getUsuarioLogueado(): Promise<any> {
    const rutLogueado = this.getRUTLogueado(); // Obtener RUT del usuario logueado
    return this.getUsuario(rutLogueado); // Retornar los datos del usuario logueado
  }   

  
}
