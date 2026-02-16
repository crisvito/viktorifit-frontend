import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionIntro } from './suggestion-intro';

describe('SuggestionIntro', () => {
  let component: SuggestionIntro;
  let fixture: ComponentFixture<SuggestionIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
