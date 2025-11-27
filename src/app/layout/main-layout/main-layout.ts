import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar'; 
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-navbar></app-navbar>
      
      <div class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
      
      <app-footer></app-footer>
    </div>
  `
})
export class MainLayout {}