import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSiderbar } from './profile-sidebar';

describe('ProfileSiderbar', () => {
  let component: ProfileSiderbar;
  let fixture: ComponentFixture<ProfileSiderbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSiderbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSiderbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
