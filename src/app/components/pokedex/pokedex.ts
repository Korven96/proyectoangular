import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonService } from '../../services/pokemon';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class PokedexComponent implements OnInit {
  pokemonList: any[] = [];
  offset = 0;
  loading = false;
  hasMore = true;

  private pokemonService = inject(PokemonService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.loading = true;
    const currentOffset = this.offset;

    this.pokemonService.getPokemonPage(currentOffset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const newPokemon = response.results.map((p: any, index: number) => {
            const id = currentOffset + index + 1;
            return {
              id: id,
              name: p.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          });

          this.pokemonList = [...this.pokemonList, ...newPokemon];
          this.cdr.markForCheck();
          this.offset += 20;
          this.hasMore = response.next !== null;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar Pokémon:', err);
          this.loading = false;
        },
      });
  }

  getIdFormatted(id: number): string {
    return '#' + id.toString().padStart(4, '0');
  }
}
