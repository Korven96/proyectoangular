import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PokedexComponent } from './components/pokedex/pokedex';
import { PokemonDetailComponent } from './components/pokemon-detail/pokemon-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokedex', component: PokedexComponent },
  { path: 'pokemon/:id', component: PokemonDetailComponent },
];


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  nombreProyecto = "Pokedex";
  descripcion = "Este es un proyecto de angular";
  autor = "Javier Calzado";
}
