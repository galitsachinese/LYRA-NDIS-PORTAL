import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar-website/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar-component></app-navbar-component>

    <div
      class="min-h-screen bg-linear-to-b from-white via-purple-50/10 to-white"
    >
      <router-outlet></router-outlet>
    </div>

    <app-footer-component></app-footer-component>
  `,
})
export class PublicLayoutComponent {}
