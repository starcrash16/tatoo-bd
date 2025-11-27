import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-artistas',
  imports: [CommonModule],
  templateUrl: './artistas.html',
  styleUrl: './artistas.css',
})
export class Artistas implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Esto permite que al navegar a /artistas#alex, la página baje automáticamente hasta esa sección
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          // Pequeño delay para asegurar que la vista cargó
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  }
}