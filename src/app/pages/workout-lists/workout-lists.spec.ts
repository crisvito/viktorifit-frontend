import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLists } from './workout-lists';


describe('WorkoutLists', () => {
  let component: WorkoutLists;
  let fixture: ComponentFixture<WorkoutLists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutLists]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutLists);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
