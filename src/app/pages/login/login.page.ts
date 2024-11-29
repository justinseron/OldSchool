import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireUsuarioService } from 'src/app/services/fireusuario.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //NgModel
  email: string = "";
  password: string = "";

  constructor(private router: Router,private alertController: AlertController, private fireUsuarioService: FireUsuarioService) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    //Limpiar los campos cuando la vista esté a punto de cargarse
    this.email = "";
    this.password = "";
  }

  async login(){
    const result = await this.fireUsuarioService.login(this.email, this.password);
      if(result){
        this.router.navigate(['/home']);
      }else{
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'CORREO O CONTRASEÑA INCORRECTOS!',
          buttons: ['Aceptar'],
        });
        await alert.present();
    }
  }
}