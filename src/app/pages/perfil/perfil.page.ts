import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  usuario: any;
  fotoPerfil: string = 'assets/images/perfildefault.png'; // Ruta por defecto para la foto de perfil

  constructor(private router: Router, private alertController: AlertController, private navController: NavController) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario") || '{}');
    const fotoGuardada = localStorage.getItem("fotoPerfil");
    if (fotoGuardada) {
      this.fotoPerfil = fotoGuardada;
    }
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

  irAViajesTerminados() {
    this.router.navigate(['home/perfil-viajes']); // Redirige a la página de viajes terminados
  }

  irAPerfil() {
    this.router.navigate(['home/perfil-detalles']);
  }

  async confirmarCerrar() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Está seguro de que desea cerrar la sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // No hacer nada si cancela
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.cerrarSesion(); // Llama a la función si se acepta
          }
        }
      ]
    });

    await alert.present(); // Mostrar la alerta
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('fotoPerfil');
    this.navController.navigateRoot('/login');
  }
}
