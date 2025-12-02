import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedienteMedico } from './expediente-medico';

describe('ExpedienteMedico', () => {
  let component: ExpedienteMedico;
  let fixture: ComponentFixture<ExpedienteMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpedienteMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
