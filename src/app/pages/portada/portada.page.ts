import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
})
export class PortadaPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    // Redirigir automáticamente a la página de login después de 3 segundos
    setTimeout(() => {
      this.navCtrl.navigateForward('/login'); // Asegúrate de que esta ruta sea correcta
    }, 2000);
  }
}