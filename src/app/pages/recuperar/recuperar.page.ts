import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ModalController } from '@ionic/angular';
import { VerificarCodigoPage } from '../verificar-codigo/verificar-codigo.page';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage implements OnInit {

  //ngModel
  email: string = "";

  constructor(private modalController: ModalController,private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit() {
  }

  async mostrarModalVerificacion(){
    const modal = await this.modalController.create({
      component: VerificarCodigoPage
    });
    return await modal.present();
  }

  async recuperarContrasena(){
    if(await this.usuarioService.recuperarUsuario(this.email)){
      this.mostrarModalVerificacion()
      this.router.navigate(['/login']);
    }else{
      alert("El Usuario No Existe")
    }
  
  }

}
