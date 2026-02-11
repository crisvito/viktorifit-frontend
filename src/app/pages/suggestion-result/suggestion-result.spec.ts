import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionResult } from './suggestion-result';

describe('SuggestionResult', () => {
  let component: SuggestionResult;
  let fixture: ComponentFixture<SuggestionResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
