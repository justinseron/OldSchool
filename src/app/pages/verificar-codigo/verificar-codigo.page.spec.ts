import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificarCodigoPage } from './verificar-codigo.page';

describe('VerificarCodigoPage', () => {
  let component: VerificarCodigoPage;
  let fixture: ComponentFixture<VerificarCodigoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificarCodigoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
