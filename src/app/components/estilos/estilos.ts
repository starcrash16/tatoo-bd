import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-estilos',
  imports: [CommonModule],
  templateUrl: './estilos.html',
  styleUrl: './estilos.css',
})
export class Estilos implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Escucha el fragmento de la URL (#realista, #blackwork, etc.) y hace scroll
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  }
}
