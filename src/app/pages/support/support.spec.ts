import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportComponent } from './support';
import { FormsModule } from '@angular/forms';

describe('SupportComponent', () => {
  let component: SupportComponent;
  let fixture: ComponentFixture<SupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 FAQ items', () => {
    expect(component.faqItems.length).toBe(6);
  });

  it('should toggle FAQ item when clicked', () => {
    expect(component.activeIndex).toBeNull();
    
    component.toggle(0);
    expect(component.activeIndex).toBe(0);
    
    component.toggle(0);
    expect(component.activeIndex).toBeNull();
    
    component.toggle(1);
    expect(component.activeIndex).toBe(1);
  });

  it('should validate email format', () => {
    component.contactData.name = 'Test User';
    component.contactData.description = 'Test description';
    
    component.contactData.email = 'test@example.com';
    expect(component.isFormValid()).toBeTrue();
    
    component.contactData.email = 'invalid-email';
    expect(component.isFormValid()).toBeFalse();
    
    component.contactData.email = 'test@domain';
    expect(component.isFormValid()).toBeFalse();
  });

  it('should limit description to 200 characters', () => {
    const event = {
      target: {
        value: 'a'.repeat(250)
      }
    } as unknown as Event;
    
    component.onTextareaInput(event);
    expect(component.contactData.description.length).toBe(200);
  });

  it('should calculate remaining characters correctly', () => {
    component.contactData.description = 'Hello World';
    expect(component.getRemainingChars()).toBe(11);
    
    component.contactData.description = 'a'.repeat(100);
    expect(component.getRemainingChars()).toBe(100);
    
    component.contactData.description = 'a'.repeat(200);
    expect(component.getRemainingChars()).toBe(200);
  });

  it('should reset form after successful submission', () => {
    component.contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      description: 'Test message'
    };
    
    spyOn(window, 'alert');
    spyOn(console, 'log');
    
    component.submitForm();
    
    setTimeout(() => {
      expect(component.contactData).toEqual({ 
        name: '', 
        email: '', 
        description: '' 
      });
    }, 1600);
  });

  it('should handle search functionality', () => {
    const searchEvent = {
      target: {
        value: 'equipment'
      }
    } as unknown as Event;
    
    spyOn(console, 'log');
    
    component.searchFAQ(searchEvent);
    
    expect(console.log).toHaveBeenCalledWith('Searching for:', 'equipment');
    expect(component.activeIndex).toBe(0);
  });
});