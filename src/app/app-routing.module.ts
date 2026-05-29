import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScannerComponent } from './components/scanner/scanner.component';
import { HistoryComponent } from './components/history/history.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'scanner', component: ScannerComponent },
  { path: 'history', component: HistoryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }