import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, ButtonModule, MenubarModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  standalone: true
})
export class LayoutComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/home'
      },
      {
        label: 'Herramientas',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Explorador de Datos',
            icon: 'pi pi-search',
            routerLink: '/explorer'
          },
          {
            label: 'Clasificador',
            icon: 'pi pi-list',
            routerLink: '/classifier'
          }
        ]
      },
      {
        label: 'Perfil',
        icon: 'pi pi-user'
      }
    ];
  }
}
