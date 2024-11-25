import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajesTerminadosPage } from './viajes-terminados.page';

describe('ViajesTerminadosPage', () => {
  let component: ViajesTerminadosPage;
  let fixture: ComponentFixture<ViajesTerminadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesTerminadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
