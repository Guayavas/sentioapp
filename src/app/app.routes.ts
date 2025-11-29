import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { ClassifierComponent } from './components/classifier/classifier.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'explorer', component: ExplorerComponent },
            { path: 'classifier', component: ClassifierComponent }
        ]
    }
];
