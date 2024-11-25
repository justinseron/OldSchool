import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesViajePage } from './detalles-viaje.page';

describe('DetallesViajePage', () => {
  let component: DetallesViajePage;
  let fixture: ComponentFixture<DetallesViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
