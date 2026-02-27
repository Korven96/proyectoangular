import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.css',
})
export class PokemonDetailComponent implements OnInit {
  pokemon: any = null;
  species: any = null;
  evolutions: any[] = [];
  loading = true;

  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.loading = true;
      this.pokemon = null;
      this.species = null;
      this.evolutions = [];
      this.cargarPokemon(id);
      this.cdr.markForCheck();
    });
  }

  cargarPokemon(id: number) {
    forkJoin<any[]>([
      this.pokemonService.getPokemonDetail(id),
      this.pokemonService.getPokemonSpecies(id),
    ]).subscribe({
      next: ([detail, species]) => {
        this.pokemon = detail;
        this.species = species;
        this.cargarEvoluciones(species.evolution_chain.url);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }

  cargarEvoluciones(url: string) {
    this.pokemonService.getEvolutionChain(url).subscribe({
      next: (data: any) => {
        this.evolutions = this.extraerEvoluciones(data.chain);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error evoluciones:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  extraerEvoluciones(chain: any): any[] {
    const result = [];
    let current = chain;

    while (current) {
      const id = this.getIdFromUrl(current.species.url);
      result.push({
        id: id,
        name: current.species.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      });
      current = current.evolves_to?.[0] || null;
    }

    return result;
  }

  getIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  getDescripcion(): string {
    if (!this.species) return '';
    const entry = this.species.flavor_text_entries.find((e: any) => e.language.name === 'es');
    return entry ? entry.flavor_text.replace(/\f/g, ' ') : '';
  }

  getStatName(stat: string): string {
    const nombres: any = {
      hp: 'HP',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Sp. Ataque',
      'special-defense': 'Sp. Defensa',
      speed: 'Velocidad',
    };
    return nombres[stat] || stat;
  }

  getStatColor(value: number): string {
    if (value >= 100) return '#4caf50';
    if (value >= 60) return '#ffd166';
    return '#e63946';
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
}
