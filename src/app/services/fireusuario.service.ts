import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular'; // Importar AlertController
@Injectable({
  providedIn: 'root'
})
export class FireUsuarioService {
  private conductorData: any;
  private usuariosSubject = new BehaviorSubject<any[]>([]);
  usuarios$ = this.usuariosSubject.asObservable();
  private rutConductorLogueado: string | null = null;

  constructor(private fireStore: AngularFirestore, private fireAuth: AngularFireAuth,private alertController: AlertController) {
    this.cargarUsuarios(); // Cargar los usuarios al iniciar el servicio
    this.crearAdminPorDefecto();
    
  }

  private async crearAdminPorDefecto() {
    const adminRut = '20792608-6'; // RUT del administrador por defecto

    const adminSnapshot = await this.fireStore.collection('usuarios').doc(adminRut).get().toPromise();
    if (!adminSnapshot?.exists) {
      const adminUsuario = {
        rut: adminRut,
        nombre: 'Administrador',
        correo: 'admin@duocuc.cl',
        "fecha_nacimiento": "2002-03-10",
        "password": "Admin123.",
        "confirm_password": "Admin123.",
        "genero": "otro",
        "tipo_usuario": "Administrador"
      };
      await this.fireStore.collection('usuarios').doc(adminRut).set(adminUsuario);
      console.log('Administrador por defecto creado');
    } else {
      console.log('El administrador ya existe');
    }
  }
  setConductorData(conductor: any) {
    this.conductorData = conductor;
  }
  getConductorDataa() {
    return this.conductorData;
  }
  async enviarCorreoRecuperacion(email: string): Promise<void> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error en el servicio de recuperación:', error);
      throw error;
    }
  }
// Este método puede ser innecesario si solo quieres enviar el correo de recuperación

  public setRutConductor(rut: string) {
    this.rutConductorLogueado = rut;
  }

  private async cargarUsuarios() {
    this.fireStore.collection('usuarios').valueChanges().subscribe((usuarios: any[]) => {
      this.usuariosSubject.next(usuarios);
    });
  }
  public getViajesPorConductor(): Observable<any[]> {
    const rutConductor = this.getRUTLogueado(); // O usa rutConductorLogueado si prefieres esa propiedad
  
    return this.fireStore.collection('viajes', ref => ref.where('rut', '==', rutConductor))
      .valueChanges();
  }
  public async crearUsuario(usuario: any): Promise<boolean> {
    try {
      // Verificar si el correo ya está registrado en Firebase Authentication
      const existingMethods = await this.fireAuth.fetchSignInMethodsForEmail(usuario.correo);
      console.log('Métodos existentes para el correo:', existingMethods); // Agregado para depuración

      if (existingMethods.length > 0) {
        // Si el correo ya está registrado, mostrar una alerta
        this.mostrarAlerta('Este correo ya está registrado. Por favor, usa otro correo.');
        return false; // El correo ya está registrado, no crear el usuario
      }

      // Si no existe el correo, proceder con la creación del usuario
      const docRef = this.fireStore.collection('usuarios').doc(usuario.rut);
      const docActual = await docRef.get().toPromise();
      if (docActual?.exists) {
        console.log('El usuario ya existe en Firestore');
        return false; // Usuario ya existe en Firestore
      }

      // Crear el usuario en Firebase Authentication
      const credencialesUsuario = await this.fireAuth.createUserWithEmailAndPassword(usuario.correo, usuario.password);
      const uid = credencialesUsuario.user?.uid;

      // Guardar el usuario en Firestore
      await docRef.set({ ...usuario, uid });

      console.log('Usuario creado exitosamente:', usuario); // Agregado para depuración

      return true; // Usuario creado exitosamente
    } catch (error: unknown) { // Aquí se le indica a TypeScript que el tipo de error es unknown
      if (error instanceof Error) { // Verificamos si 'error' es una instancia de 'Error'
        console.error('Error al crear usuario:', error); // Esto mostrará el error completo en la consola
        if (error.message.includes('auth/email-already-in-use')) {
          this.mostrarAlerta('Este correo ya está registrado. Por favor, usa otro correo.');
        } else {
          this.mostrarAlerta(`Hubo un error al crear el usuario. Error: ${error.message}`);
        }
      } else {
        console.error('Error desconocido:', error);
        this.mostrarAlerta('Hubo un error desconocido al crear el usuario.');
      }
      return false; // Hubo un error en la creación del usuario
    }
  }
  
  private async mostrarAlerta(mensaje: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }


  public getUsuarios(): Observable<any[]> {
    return this.fireStore.collection('usuarios').valueChanges();
  }

  public getUsuario(rut: string): Observable<any | undefined> {
    return this.fireStore.collection('usuarios').doc(rut).valueChanges();
  }

  public async getUsuarioPorRut(rut: string) {
    const snapshot = await this.fireStore.collection('usuarios', ref => ref.where('rut', '==', rut)).get().toPromise();
    if (snapshot && !snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null; // Retorna null si no se encontró el usuario
  }

  public updateUsuario(usuario: any, value: Partial<{ rut: string | null; nombre: string | null; correo: string | null; fecha_nacimiento: string | null; password: string | null; confirm_password: string | null; genero: string | null; tipo_usuario: string | null; }>): Promise<boolean> {
    return this.fireStore.collection('usuarios').doc(usuario.rut).update(usuario).then(() => {
      if (usuario.rut === this.getRUTLogueado()) {
        localStorage.setItem('usuario', JSON.stringify(usuario));  // Actualiza los datos en el almacenamiento local
      }
      return true;
    }).catch(() => false);
  }
  

  public async deleteUsuario(rut: string): Promise<boolean> {
    console.log("Eliminando usuario con rut:", rut); // Verifica que el rut sea correcto
    try {
      // Obtener el correo vinculado al RUT desde Firestore
      const usuarioDoc = await this.fireStore.collection('usuarios').doc(rut).get().toPromise();
      if (!usuarioDoc?.exists) {
        console.error("El usuario con el RUT proporcionado no existe.");
        return false;
      }
  
      const usuarioData = usuarioDoc.data() as any;
      const correo = usuarioData.correo;
  
      // Eliminar el usuario de Firebase Authentication si está autenticado como el mismo
      if (correo) {
        const usuarioActual = await this.fireAuth.currentUser;
        if (usuarioActual?.email === correo) {
          // Si el usuario logueado es el mismo, desloguearlo antes de eliminarlo
          await this.fireAuth.signOut();
        }
        
        // Eliminar el usuario de Firestore directamente sin necesidad de su contraseña
        await this.fireStore.collection('usuarios').doc(rut).delete();
        console.log("Usuario eliminado con éxito de Firestore.");
      }
  
      return true;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return false;
    }
  }
  
  

  public getUserRut(): string {
    return localStorage.getItem('userRut') || '';
  }

  public getRUTLogueado(): string {
    return localStorage.getItem('userRut') || '';
  }

  async RecuperarUsuario(email: string): Promise<boolean> {
    try {
      const user = await this.fireAuth.fetchSignInMethodsForEmail(email);
      return user.length > 0; // Si hay métodos de inicio de sesión para el correo, el usuario existe
    } catch (error) {
      console.error('Error al recuperar usuario:', error);
      throw error;
    }
  }
  
  public async getNombrePorRut(rut: string): Promise<string | null> {
    const usuarioSnapshot = await this.fireStore.collection('usuarios').doc(rut).get().toPromise();
    return usuarioSnapshot?.exists ? (usuarioSnapshot.data() as { nombre?: string }).nombre || null : null;
  }

  public getUsuarioLogueado(): Observable<any | undefined> {
    const rutLogueado = this.getRUTLogueado();
    return this.getUsuario(rutLogueado);
  }

  public async getConductorPorNombre(nombre: string): Promise<any | null> {
    const snapshot = await this.fireStore.collection('usuarios', ref =>
      ref.where('tipo_usuario', '==', 'Colaborador').where('nombre', '==', nombre)
    ).get().toPromise();
  
    if (snapshot && !snapshot.empty) {
      return snapshot.docs[0].data();
    } else {
      return null;
    }
  }

  public getConductorData(nombre: string): Observable<any | null> {
    return this.fireStore.collection('usuarios', ref =>
      ref.where('tipo_usuario', '==', 'Colaborador').where('nombre', '==', nombre)
    ).snapshotChanges().pipe(
      map(actions => {
        if (actions.length > 0) {
          const conductor = actions[0].payload.doc.data();
          return conductor;
        } else {
          return null;
        }
      })
    );
  }

  public getRutConductor(nombre: string): Observable<string | null> {
    return this.fireStore.collection('usuarios', ref =>
      ref.where('tipo_usuario', '==', 'Colaborador').where('nombre', '==', nombre)
    ).snapshotChanges().pipe(
      map(actions => {
        if (actions.length > 0) {
          const conductor = actions[0].payload.doc.data() as any;
          return conductor.rut || null;
        } else {
          return null;
        }
      })
    );
  }

  public async login(correo: string, contrasena: string): Promise<boolean> {
    try {
      // Usar Firebase Auth para iniciar sesión
      await this.fireAuth.signInWithEmailAndPassword(correo, contrasena);
      
      // Obtener los datos del usuario de Firestore después de un inicio de sesión exitoso
      const usuariosSnapshot = await this.fireStore.collection('usuarios', ref => ref.where('correo', '==', correo)).get().toPromise();
      
      if (usuariosSnapshot && !usuariosSnapshot.empty) {
        const usuario = usuariosSnapshot.docs[0].data() as { rut: string; nombre: string };
        const rut = usuario.rut || '';
        const nombre = usuario.nombre || '';
    
        localStorage.setItem('userRut', rut);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('nombreConductor', nombre);
        
        return true;  // Inicio de sesión exitoso
      }
      
      return false;  // Si no se encuentra el usuario en Firestore
    } catch (error) {
      console.error('Error en el login:', error);
      return false;  // Error en el login
    }
  }
  
  
  
  public async getConductores(): Promise<any[]> {
    const snapshot = await this.fireStore.collection('usuarios', ref => ref.where('tipo_usuario', '==', 'Colaborador')).get().toPromise();
    if (snapshot) {
      return snapshot.docs.map(doc => doc.data());
    }
    return [];
  }

  public async getPasajeros(): Promise<any[]> {
    const snapshot = await this.fireStore.collection('usuarios', ref => ref.where('tipo_usuario', '==', 'Usuario')).get().toPromise();
    if (snapshot) {
      return snapshot.docs.map(doc => doc.data());
    }
    return [];
  }



}
  