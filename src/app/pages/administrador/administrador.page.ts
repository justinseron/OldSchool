import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FireUsuarioService } from 'src/app/services/fireusuario.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage implements OnInit {
  persona = new FormGroup({
    rut: new FormControl('', [Validators.minLength(9), Validators.maxLength(10), Validators.required, Validators.pattern("[0-9]{7,8}-[0-9kK]{1}")]),
    nombre: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\\s]+$")]),
    correo: new FormControl('', [Validators.required, Validators.pattern("[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]),
    fecha_nacimiento: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")]),
    confirm_password: new FormControl('', [Validators.required, Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")]),
    genero: new FormControl('', [Validators.required]),
    tipo_usuario: new FormControl('', [Validators.required]),
  });

  usuarios: any[] = [];
  botonModificar: boolean = true;

  constructor(private alertController: AlertController, private router: Router, private cdr: ChangeDetectorRef, private fireUsuarioService: FireUsuarioService, private loadingController: LoadingController) {
    this.persona.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()]);
  }

  async ngOnInit() {
    this.fireUsuarioService.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios;
      this.cdr.detectChanges();
    });

    this.persona.statusChanges.subscribe(() => {
      this.botonModificar = this.persona.valid;  // Habilita el botón solo si el formulario es válido
      this.cdr.detectChanges();
    });
  }

  actualizarTipoUsuario() {
    const tipoUsuarioControl = this.persona.get('tipo_usuario');
    if (tipoUsuarioControl) {
      tipoUsuarioControl.setValue('Usuario');
    }
  }

  async cargarUsuarios() {
    this.usuarios = (await this.fireUsuarioService.getUsuarios().toPromise()) || [];
    this.cdr.detectChanges();
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

  private async mostrarAlerta(titulo: string, mensaje: string) {
    console.log("Mostrando alerta...");  // Verifica si la alerta es llamada
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  validarEdad60(fecha_nacimiento: string) {
    const fecha_date = new Date(fecha_nacimiento);
    const timeDiff = Math.abs(Date.now() - fecha_date.getTime());
    const edad = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
    return edad >= 60;
  }

  async registrar() {
    const loading = await this.mostrarCargando();
  
    if (!this.validarEdad60(this.persona.controls.fecha_nacimiento.value || "")) {
      loading.dismiss();
      await this.mostrarAlerta("Error", "¡Debe tener al menos 60 años para registrarse!");
      return;
    }
  
    if (this.persona.controls.password.value !== this.persona.controls.confirm_password.value) {
      loading.dismiss();
      await this.mostrarAlerta("Error", "¡Las contraseñas no coinciden!");
      return;
    }
  
    const usuarioData = {
      ...this.persona.value,
      tipo_usuario: 'Usuario', // Se asegura que el tipo_usuario sea 'Usuario'
    };
  
    if (await this.fireUsuarioService.crearUsuario(usuarioData)) {
      loading.dismiss();
      await this.mostrarAlerta("Éxito", "¡Usuario registrado con éxito!");
      this.persona.reset();
    } else {
      loading.dismiss();
      await this.mostrarAlerta("Error", "¡Error! Usuario ya existe.");
    }
  }

  async buscar(usuario: any) {
    const loading = await this.mostrarCargando();
    if (usuario) {
      loading.dismiss();
      this.persona.reset();  // Resetea el formulario antes de llenarlo
      this.persona.patchValue(usuario);  // Ahora aplica los valores del usuario
      this.botonModificar = true;
    } else {
      await this.mostrarAlerta("Error", "¡Usuario no encontrado!");
      this.botonModificar = false;
    }
  }

  async modificar() {
    const loading = await this.mostrarCargando();
    const rut_buscar: string = this.persona.controls.rut.value || "";
  
    // Validación de edad
    console.log("Validando edad...");
    if (!this.validarEdad60(this.persona.controls.fecha_nacimiento.value || "")) {
      console.log("Edad no válida");
      await this.mostrarAlerta("Error", "¡El usuario debe tener al menos 18 años para modificar sus datos!");
      return;
    }
  
    try {
      // Llamada a updateUsuario y manejo del resultado
      console.log("Actualizando usuario...");
      const usuarioData = { rut: rut_buscar, ...this.persona.value };
  
      // Se guarda el resultado de la actualización
      const resultado = await this.fireUsuarioService.updateUsuario(rut_buscar, usuarioData);
      console.log("Resultado de actualización:", resultado);  // Ver el valor exacto de resultado
  
      // Verificamos si la actualización fue exitosa de manera más sencilla
      if (resultado) { // Si cualquier valor se considera éxito, continuamos
        loading.dismiss();
        // Actualiza la lista de usuarios
        await this.cargarUsuarios();
        console.log("Usuario actualizado con éxito");
        // Muestra la alerta de éxito
        await this.mostrarAlerta("Éxito", "¡Usuario modificado con éxito!");
  
        // Resetea el formulario y actualiza el estado del botón
        this.botonModificar = true;
        this.persona.reset();
      } else {
        console.log("Error al modificar usuario. Resultado:", resultado);
        await this.mostrarAlerta("Error", "¡Error! Usuario no modificado.");
      }
    } catch (error: any) {
      console.error("Error en modificar usuario:", error);
      // Mensajes de error generales para errores de red u otros problemas
      await this.mostrarAlerta("Error", "Ocurrió un error inesperado.");
    }
  
    // Forzar la detección de cambios en la interfaz (si fuera necesario)
    this.cdr.detectChanges();
  }

  validarRut():ValidatorFn {
    return () => {
      const rut = this.persona.controls.rut.value;
      const dv_validar = rut?.replace("-","").split("").splice(-1).reverse()[0];
      let rut_limpio = [];
      if(rut?.length == 10){
        rut_limpio = rut?.replace("-","").split("").splice(0,8).reverse();
      } else {
        rut_limpio = rut?.replace("-","").split("").splice(0,7).reverse() || [];
      }
      let factor = 2;
      let total = 0;
      for(let num of rut_limpio){
        total = total + ((+num)*factor);
        factor = factor + 1;
        if(factor == 8){
          factor = 2;
        }
      }
      var dv = (11-(total%11)).toString();
      if(+dv >= 10){
        dv = "k";
      }
      if (dv_validar !== dv) return { rutInvalido: true };
      return null;
    };
  }

  async eliminar(rut_eliminar: string) {
    // 1. Muestra la alerta de confirmación primero.
    const confirmacion = await this.presentConfirmAlert(
      "Confirmar Eliminación", 
      "¿Estás seguro de que deseas eliminar este usuario?"
    );
  
    // 2. Si el usuario confirma la eliminación, muestra el cargando y ejecuta la eliminación.
    if (confirmacion) {
      // 3. Muestra el cargando antes de proceder con la eliminación.
      const loading = await this.mostrarCargando();
  
      // 4. Eliminar el usuario con el servicio FireUsuarioService.
      const usuarioEliminado = await this.fireUsuarioService.deleteUsuario(rut_eliminar);
  
      // 5. Si la eliminación fue exitosa, actualizar la lista de usuarios.
      if (usuarioEliminado) {
        await this.cargarUsuarios();
        await this.mostrarAlerta("Éxito", "¡Usuario eliminado con éxito!");
      } else {
        await this.mostrarAlerta("Error", "¡Hubo un error al eliminar el usuario!");
      }
  
      // 6. Ocultar el cargando.
      loading.dismiss();
    }
  }
  
  async presentConfirmAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            return true;
          },
        },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }
}
