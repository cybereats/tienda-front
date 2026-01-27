import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../../services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'c-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader {
  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
