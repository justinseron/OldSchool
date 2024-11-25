import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-perfil-detalles',
  templateUrl: './perfil-detalles.page.html',
  styleUrls: ['./perfil-detalles.page.scss'],
})
export class PerfilDetallesPage implements OnInit {
  usuarioLogueado: any;
  correoInvalido: boolean = false;
  fechaInvalida: boolean = false;

  constructor(private usuarioService: UsuarioService, private router: Router,private alertController: AlertController) {}

  async ngOnInit() {

    this.usuarioLogueado = await this.usuarioService.getUsuarioLogueado();
  }

  volver(){
    this.router.navigate(['home/perfil']);
  }

  validarCorreo() {
    const correoRegex = /^[a-zA-Z0-9._%+-]+@duocuc\.cl$/;
    this.correoInvalido = !correoRegex.test(this.usuarioLogueado.correo);
  }

  validarFechaNacimiento() {
    const fechaNacimiento = new Date(this.usuarioLogueado.fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    this.fechaInvalida = (edad < 18 || (edad === 18 && mes < 0));
  }
  async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Los datos se han guardado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async guardarCambios() {
    if (!this.correoInvalido && !this.fechaInvalida) {
      await this.usuarioService.updateUsuario(this.usuarioLogueado.rut, this.usuarioLogueado);
      this.usuarioLogueado = await this.usuarioService.getUsuarioLogueado(); 
      this.mostrarAlertaExito();
      this.volver();
    }
  }
}
