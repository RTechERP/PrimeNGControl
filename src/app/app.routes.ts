import { Routes } from '@angular/router';
import { TestPdfComponent } from './components/test-pdf/test-pdf.component';

export const routes: Routes = [
    { path: 'test-pdf', component: TestPdfComponent },
    { path: '', redirectTo: 'test-pdf', pathMatch: 'full' }
];
