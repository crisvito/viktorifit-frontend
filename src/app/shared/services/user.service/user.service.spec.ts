import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let component: UserService;
  let fixture: ComponentFixture<UserService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
