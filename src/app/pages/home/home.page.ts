import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(private router: Router, private navController: NavController) {}

  usuario: any;

  ngOnInit(){
    this.usuario = JSON.parse(localStorage.getItem("usuario") || '');
  }

  logout(){
    localStorage.removeItem('usuario');
    this.navController.navigateRoot('/login');
  }

  goToHome(){
    this.router.navigate(['/home']);
  }

}
