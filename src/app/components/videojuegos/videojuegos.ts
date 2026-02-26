import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videojuegos',
  imports: [FormsModule],
  templateUrl: './videojuegos.html',
  styleUrl: './videojuegos.css',
})
export class Videojuegos {

  videojuegos: string[] =[];
  nuevoJuego: string = "";

  mensajeError: string = "";
  editIndex: number | null = null;
  editNombre: string ="";

  addJuego(){
    if(this.nuevoJuego && this.nuevoJuego.trim()){
      const juegoNormalizado = this.nuevoJuego.trim().toLowerCase();

      const existe = this.videojuegos.some(
        (juego) => juego.toLowerCase() === juegoNormalizado
      );


      if (!existe) {
        this.videojuegos.push(this.nuevoJuego.trim());
        this.mensajeError = '';
      } else {
        this.mensajeError = 'Ese videojuego ya existe en la lista.';
      }

      this.nuevoJuego = "";
    }
  }

  deleteJuego(index: number){
    this.videojuegos.splice(index, 1);

    if (this.editIndex === index){
      this.cancelarEdit();
    }
  }

  updateJuegos(index: number){
    this.editIndex = index;
    this.editNombre = this.videojuegos[index];
  }

  guardarEdit(){
    if(!this.editNombre.trim()) return;

    const nombreNormalizado = this.editNombre.trim().toLowerCase();

    const existe = this.videojuegos.some(
      (juego, index) => juego.toLowerCase() === nombreNormalizado && index !== this.editIndex
    );
    if (existe){
      this.mensajeError = 'Ese videjuego ya existe ne la lista.';
      return;
    }

    this.videojuegos[this.editIndex!] = this.editNombre.trim();
    this.cancelarEdit();
    this.mensajeError="";
  }
  cancelarEdit(){
    this.editIndex = null;
    this.editNombre ="";
  }
}
