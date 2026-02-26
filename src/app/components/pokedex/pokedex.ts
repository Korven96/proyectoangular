import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonService } from '../../services/pokemon';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PokedexComponent implements OnInit {
  pokemonList: any[] = [];
  offset = 0;
  loading = false;
  hasMore = true;

  filtroAbierto = false;
  tipos: string[] = [
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy',
  ];

  tiposSeleccionados: string[] = [];

  tiposAplicados: string[] = [];

  get pokemonFiltrados() {
    if (this.tiposAplicados.length === 0) return this.pokemonList;
    return this.pokemonList.filter((p) =>
      this.tiposAplicados.every((t: string) => p.types.includes(t)),
    );
  }

  toggleTipo(tipo: string) {
    if (this.tiposSeleccionados.includes(tipo)) {
      this.tiposSeleccionados = this.tiposSeleccionados.filter((t) => t !== tipo);
      return;
    }
    if (this.tiposSeleccionados.length >= 2) return;
    this.tiposSeleccionados = [...this.tiposSeleccionados, tipo];
  }

  isTipoSeleccionado(tipo: string): boolean {
    return this.tiposSeleccionados.includes(tipo);
  }

  limpiarFiltros() {
    this.tiposSeleccionados = [];
    this.tiposAplicados = [];
  }

  toggleFiltro() {
    this.filtroAbierto = !this.filtroAbierto;
  }

  aplicarFiltros() {
    this.tiposAplicados = [...this.tiposSeleccionados];
    if (this.tiposAplicados.length > 0 && this.hasMore) {
      this.pokemonList = [];
      this.offset = 0;
      this.loadAll();
    }
    this.filtroAbierto = false;
  }

  private pokemonService = inject(PokemonService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    const currentOffset = this.offset;

    this.pokemonService
      .getPokemonPage(currentOffset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const detailCalls = response.results.map((_: any, index: number) => {
            const id = currentOffset + index + 1;
            return this.pokemonService.getPokemonDetail(id);
          });

          forkJoin<any[]>(detailCalls).subscribe({
            next: (details: any) => {
              const newPokemon = details.map((detail: any) => ({
                id: detail.id,
                name: detail.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
                types: detail.types.map((t: any) => t.type.name),
              }));

              this.pokemonList = [...this.pokemonList, ...newPokemon];
              this.offset += 20;
              this.hasMore = response.next !== null;
              this.loading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Error al cargar detalles:', err);
              this.loading = false;
            },
          });
        },
        error: (err) => {
          console.error('Error al cargar Pokémon:', err);
          this.loading = false;
        },
      });
  }

  loadAll() {
    if (this.loading) return;
    this.loading = true;
    this.pokemonList = [];
    this.offset = 0;

    const cargarLote = (offset: number) => {
      this.pokemonService.getPokemonPage(offset).subscribe({
        next: (response: any) => {
          const detailCalls = response.results.map((_: any, index: number) => {
            const id = offset + index + 1;
            return this.pokemonService.getPokemonDetail(id);
          });

          forkJoin<any[]>(detailCalls).subscribe({
            next: (details: any[]) => {
              const newPokemon = details.map((detail: any) => ({
                id: detail.id,
                name: detail.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
                types: detail.types.map((t: any) => t.type.name),
              }));

              this.pokemonList = [...this.pokemonList, ...newPokemon];
              this.cdr.markForCheck();

              if (response.next !== null) {
                cargarLote(offset + 20);
              } else {
                this.hasMore = false;
                this.loading = false;
                this.cdr.markForCheck();
              }
            },
            error: (err) => {
              console.error('Error:', err);
              this.loading = false;
              this.cdr.markForCheck();
            },
            complete: () => {
              this.cdr.markForCheck();
            },
          });
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading = false;
        },
      });
    };

    cargarLote(0);
  }

  getIdFormatted(id: number): string {
    return '#' + id.toString().padStart(4, '0');
  }
}
