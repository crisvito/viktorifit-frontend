import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmiGauge } from './bmi-gauge';

describe('BmiGauge', () => {
  let component: BmiGauge;
  let fixture: ComponentFixture<BmiGauge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmiGauge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BmiGauge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
