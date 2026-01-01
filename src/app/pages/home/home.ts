import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-home',        
  imports: [ButtonComponent],
  templateUrl: './home.html',  
  styleUrls: ['./home.css']    
})

export class HomePage {}