import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FireUsuarioService } from 'src/app/services/fireusuario.service';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  //VARIABLES:
  persona = new FormGroup({
    rut: new FormControl('',[Validators.minLength(9),Validators.maxLength(10),Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}")]),
    nombre: new FormControl('',[Validators.required,Validators.maxLength(20),Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\\s]+$") ]),
    correo: new FormControl('',[Validators.required, Validators.pattern("[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]),
    fecha_nacimiento: new FormControl('',[Validators.required]),
    password: new FormControl('',[Validators.required, Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")]),
    confirm_password: new FormControl('',[Validators.required, Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")]),
    genero: new FormControl('',[Validators.required]),
    tipo_usuario: new FormControl('Pasajero'),
  });

  fotoPerfil: string = 'assets/images/perfildefault.png';
  correo: any;


  constructor(private router: Router, private loadingController: LoadingController,private alertController: AlertController,private fireusuarioService: FireUsuarioService) { 
    this.persona.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()]);
  }

  ngOnInit() {
  }
  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });
  
    await alert.present();
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
  
  
  public async registrar() {
    if (!this.validarEdad18(this.persona.controls.fecha_nacimiento.value || "")) {
      await this.mostrarAlerta("Error", "¡Debe tener al menos 18 años para registrarse!");
      return;
    }
  
    if (this.persona.controls.password.value !== this.persona.controls.confirm_password.value) {
      await this.mostrarAlerta("Error", "¡Las contraseñas no coinciden!");
      return;
    }
    this.persona.controls.tipo_usuario.setValue("Usuario");
  
    if (await this.fireusuarioService.crearUsuario(this.persona.value)) {
      this.router.navigate(['/login']);
      this.persona.reset();
      await this.mostrarAlerta("Éxito", "¡Usuario creado con éxito!");
    }
  }
  

  //Validador con variables necesarias. validadorDeEdad control por defecto de Angular contra errores, para validaciones se usa AbstractControl
  //el key string boolean null es para los mensajes de alerta mas que nada, el key string es para identificar cada error por la alerta por ej :dateTooOld o AgeTooYoung etc
  validarEdad18(fecha_nacimiento: string){
    var edad = 0;
    if(fecha_nacimiento){
      const fecha_date = new Date(fecha_nacimiento);
      const timeDiff = Math.abs(Date.now() - fecha_date.getTime());
      edad = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
    }
    if(edad>=18){
      return true;
    }else{
      return false;
    }
  }

  /*  BENDITO SEA   ^
                    |    */              

  //MÉTODOS:
  validarRut():ValidatorFn{
    return () => {
      const rut = this.persona.controls.rut.value;
      const dv_validar = rut?.replace("-","").split("").splice(-1).reverse()[0];
      let rut_limpio = [];
      if(rut?.length==10){
        rut_limpio = rut?.replace("-","").split("").splice(0,8).reverse();
      }else{
        rut_limpio = rut?.replace("-","").split("").splice(0,7).reverse() || [];
      }
      let factor = 2;
      let total = 0;
      for(let num of rut_limpio){
        total = total + ((+num)*factor);
        factor = factor + 1;
        if(factor==8){
          factor = 2;
        }
      }
      var dv = (11-(total%11)).toString();
      if(+dv>=10){
        dv = "k";
      }
      if(dv_validar!=dv.toString()) return {isValid: false};
      return null;
    };
  }

  cambiarFotoPerfil(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPerfil = reader.result as string;
        // Guardar la foto en localStorage
        localStorage.setItem("fotoPerfil", this.fotoPerfil);
      };
      reader.readAsDataURL(archivo);
    }
  }  


}
