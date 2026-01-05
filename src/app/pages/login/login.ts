import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {

}
