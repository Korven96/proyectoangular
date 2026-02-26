import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PokemonService } from '../../services/pokemon';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class PokedexComponent implements OnInit {
  pokemonList: any[] = [];
  offset = 0;
  loading = false;
  hasMore = true;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    const currentOffset = this.offset; // 👈 guardamos el offset actual

    this.pokemonService.getPokemonPage(currentOffset).subscribe({
      next: (response: any) => {
        const newPokemon = response.results.map((p: any, index: number) => {
          const id = currentOffset + index + 1; // 👈 usamos currentOffset
          return {
            id: id,
            name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          };
        });

        this.pokemonList = [...this.pokemonList, ...newPokemon];
        this.offset += 20;
        this.hasMore = response.next !== null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }

  getIdFormatted(id: number): string {
    return '#' + id.toString().padStart(4, '0');
  }
}
