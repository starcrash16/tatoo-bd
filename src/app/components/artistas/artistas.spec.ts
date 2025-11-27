import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Artistas } from './artistas';

describe('Artistas', () => {
  let component: Artistas;
  let fixture: ComponentFixture<Artistas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Artistas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Artistas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
