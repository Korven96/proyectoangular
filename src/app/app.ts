import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';



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
