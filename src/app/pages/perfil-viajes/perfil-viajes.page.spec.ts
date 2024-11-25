import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilViajesPage } from './perfil-viajes.page';

describe('PerfilViajesPage', () => {
  let component: PerfilViajesPage;
  let fixture: ComponentFixture<PerfilViajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilViajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
