import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PokedexComponent } from './components/pokedex/pokedex';
import { PokemonDetailComponent } from './components/pokemon-detail/pokemon-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokedex', component: PokedexComponent },
  { path: 'pokemon/:id', component: PokemonDetailComponent },
  { path: '**', redirectTo: '' },
];
