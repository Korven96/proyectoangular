import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonService } from '../../services/pokemon';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PokedexComponent implements OnInit {
  pokemonList: any[] = [];
  offset = 0;
  loading = false;
  hasMore = true;

  busqueda = '';

  busquedaAplicada = '';

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
    let lista = this.pokemonList;

    if (this.tiposAplicados.length > 0) {
      lista = lista.filter((p) => this.tiposAplicados.every((t: string) => p.types.includes(t)));
    }

    if (this.busquedaAplicada !== '') {
      lista = lista.filter((p) =>
        p.name.toLowerCase().includes(this.busquedaAplicada.toLowerCase()),
      );
    }

    return lista;
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
    this.busqueda = '';
    this.busquedaAplicada = '';
  }

  toggleFiltro() {
    this.filtroAbierto = !this.filtroAbierto;
  }

  aplicarFiltros() {
    this.tiposAplicados = [...this.tiposSeleccionados];
    this.busquedaAplicada = this.busqueda.trim();
    this.filtroAbierto = false;

    if ((this.tiposAplicados.length > 0 || this.busquedaAplicada !== '') && this.hasMore) {
      this.pokemonList = [];
      this.offset = 0;
      this.loadAll();
    }
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
  getTypeColor(type: string): string {
    const colores: any = {
      fire: '#ff4500',
      water: '#0078ff',
      grass: '#32b432',
      electric: '#ffd200',
      psychic: '#dc0078',
      ice: '#64dcff',
      dragon: '#5000c8',
      dark: '#3c2814',
      fairy: '#ff96c8',
      normal: '#a0a078',
      fighting: '#b42800',
      flying: '#8296ff',
      poison: '#960096',
      ground: '#c8a03c',
      rock: '#8c783c',
      bug: '#64a000',
      ghost: '#503c8c',
      steel: '#a0a0c8',
    };
    return colores[type] || '#888';
  }

  getIdFormatted(id: number): string {
    return '#' + id.toString().padStart(4, '0');
  }
}
