import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components';

@Component({
  selector: 'app-register',
  imports: [RouterModule, ButtonComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterPage {

}
