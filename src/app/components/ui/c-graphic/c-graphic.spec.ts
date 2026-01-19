import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CGraphic } from './c-graphic';

describe('CGraphic', () => {
  let component: CGraphic;
  let fixture: ComponentFixture<CGraphic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CGraphic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CGraphic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
