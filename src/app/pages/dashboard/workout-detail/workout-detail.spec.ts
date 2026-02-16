import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDetail } from './workout-detail';

describe('WorkoutDetail', () => {
  let component: WorkoutDetail;
  let fixture: ComponentFixture<WorkoutDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
