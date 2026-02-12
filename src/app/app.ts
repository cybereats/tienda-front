import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CHeader } from "./components/ui/c-header/c-header";
import { CFooter } from "./components/ui/c-footer/c-footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CHeader, CFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  readonly router = inject(Router);
  paths = ['/login', '/register'];
  currentUrl = signal('');
  protected readonly title = signal('tienda-front');
  isChatOpen = false;

  ngOnInit() {
    this.currentUrl.set(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }

  get themeClass(): string {
    return (this.currentUrl() === '/food' || this.currentUrl() === '/cart') ? 'theme-food' : '';
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }
}
