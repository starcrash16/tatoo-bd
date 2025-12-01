import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  
  scrollDirection: 'none' | 'down' | 'up' = 'none';
  
  private lastScrollTop = 0;
  private scrollThreshold = 50;

  constructor(private router: Router) {}

  ngOnInit() {}

  ingresarAlSistema() {
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll') 
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - this.lastScrollTop) > 5) { 
        if (scrollTop > this.lastScrollTop) {
            this.scrollDirection = 'down';
        } else {
            this.scrollDirection = 'up';
        }
    }
    
    if (scrollTop <= 0) {
        this.scrollDirection = 'up'; 
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}