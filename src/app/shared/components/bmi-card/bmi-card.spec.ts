import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmiCard } from './bmi-card';

describe('BmiCard', () => {
  let component: BmiCard;
  let fixture: ComponentFixture<BmiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmiCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BmiCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
