import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-social-auth',
  templateUrl: './social-auth.component.html',
  styleUrls: ['./social-auth.component.css']
})
export class SocialAuthComponent implements OnInit {
  private code!: string;
  private accessToken!: string;

  public readonly GITHUB_CLIENT_ID = environment.GITHUB_CLIENT_ID;
  public readonly STACK_OVERFLOW_CLIENT_ID = environment.STACK_OVERFLOW_CLIENT_ID;
  private readonly GITHUB_CLIENT_SECRET = '1e70ed907875eb633f6232235e4c4037888d0adb';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  getGHAccessToken(): void {
    this.authService.getGithubAccessTokenFromCode(this.code).subscribe({
      next: (response: any) => {
        console.log('ACCESS TOKEN: ', response);
        console.log('GH USER Connected');
        localStorage.setItem(this.authService.TOKEN_NAME, this.accessToken);

        this.authService.getGHUser().subscribe({
          next: (response: any) => {
            this.authService.user = response;
            console.log('AUTHING USER: ', response);
          }
        })
      },
      error: (_error: HttpErrorResponse) => {
        console.log('ERR: ', _error);
        // this.router.navigateByUrl('/login');
      }
    })
  }

  getSOAccessToken(): void {
    if (this.accessToken) {
      this.router.navigateByUrl('/');
      this.authService.SOLogin();
      localStorage.setItem(this.authService.TOKEN_NAME, this.accessToken);

      // this.authService.getSOUser().subscribe({
      //   next: (response: any) => {
      //     this.authService.user = response;
      //     console.log('AUTHING USER: ', response); 
      //   }
      // })
    }
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParamMap.get('code')!;
    this.accessToken = this.route.snapshot.fragment?.split('=')[1]!;

    if (this.code) {
      this.getGHAccessToken();
    } else {
      this.getSOAccessToken();
    }

  }

}
