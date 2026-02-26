import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Home } from './components/home/home';
import { PokedexComponent } from './components/pokedex/pokedex';


export const routes: Routes = [
  { path: '', component: Home },           // Pagina de inicio
  { path: 'pokedex', component: PokedexComponent }, // Pokedex
  { path: '**', redirectTo: '' },          // Cualquier ruta no encontrada redirige al inicio
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule{ }
