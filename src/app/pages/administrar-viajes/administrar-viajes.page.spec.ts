import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrarViajesPage } from './administrar-viajes.page';

describe('AdministrarViajesPage', () => {
  let component: AdministrarViajesPage;
  let fixture: ComponentFixture<AdministrarViajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrarViajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
