import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilDetallesPage } from './perfil-detalles.page';

describe('PerfilDetallesPage', () => {
  let component: PerfilDetallesPage;
  let fixture: ComponentFixture<PerfilDetallesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilDetallesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
