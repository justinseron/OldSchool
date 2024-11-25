import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children:[
      {
        path: 'viajes',
        loadChildren: () => import('../viajes/viajes.module').then( m => m.ViajesPageModule)
      },
      {
        path: 'mis-viajes',
        loadChildren: () => import('../vista-admin/vista-admin.module').then( m => m.VistaAdminPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then( m => m.PerfilPageModule)
      },
      {
        path: 'administrar-viajes',
        loadChildren: () => import('../administrar-viajes/administrar-viajes.module').then(m => m.AdministrarViajesPageModule)
      },
      {
        path: 'administrador',
        loadChildren: () => import('../administrador/administrador.module').then(m => m.AdministradorPageModule)
      },
      {
        path: 'perfil-viajes',
        loadChildren: () => import('../perfil-viajes/perfil-viajes.module').then( m => m.PerfilViajesPageModule)
      },
      {
        path: 'viajes-terminados',
        loadChildren: () => import('../viajes-terminados/viajes-terminados.module').then( m => m.ViajesTerminadosPageModule)
      },
      {
        path: 'perfil-detalles',
        loadChildren: () => import('../perfil-detalles/perfil-detalles.module').then( m => m.PerfilDetallesPageModule)
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
