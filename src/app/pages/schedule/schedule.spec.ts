import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchedulePage } from './schedule';

describe('Schedule', () => {
  let component: SchedulePage;
  let fixture: ComponentFixture<SchedulePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
