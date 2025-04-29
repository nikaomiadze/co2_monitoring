import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ReactiveFormsModule,
    RouterLink,
    ProgressSpinnerModule,
    CommonModule
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
isLoggedIn: any;
 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      this.authService.login({username, password}).subscribe({
        next: (res) => {
          this.loading = false;
          localStorage.setItem('Token', res.accessToken);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          if(err.status==401){
            alert("მომხმარებლის სახელი ან პაროლი არასწორია.");
          }else if(err.status==500){
            alert("სისტემური ხარვეზი, გთხოვთ სცადოთ მოგვიანებით.");
          }
        }
      });
    }
  }
}