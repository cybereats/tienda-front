import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPopup } from './c-popup';

describe('CPopup', () => {
  let component: CPopup;
  let fixture: ComponentFixture<CPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
