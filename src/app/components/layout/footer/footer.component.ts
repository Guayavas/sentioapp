import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-[#00923f] text-white py-6 mt-auto">
        <div class="container mx-auto px-4 text-center">
          <p class="text-sm m-0">© 2025 Universidad de Nariño - SentioApp</p>
          <p class="text-xs text-green-100 mt-1 m-0">Todos los derechos reservados. Sistema de Gestión de Bienestar Estudiantil</p>
        </div>
    </footer>
  `
})
export class FooterComponent {}
