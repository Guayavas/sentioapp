import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-classifier',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="p-4">
      <p-card header="Clasificador de Información">
        <p class="m-0">
          Esta herramienta está en construcción. Aquí podrás clasificar las respuestas importadas.
        </p>
      </p-card>
    </div>
  `,
  styles: []
})
export class ClassifierComponent {}
