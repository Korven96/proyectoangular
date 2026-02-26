import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  private limit = 20;

  constructor(private http: HttpClient) {}

  getPokemonPage(offset: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon?limit=${this.limit}&offset=${offset}`);
  }
  getPokemonDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon/${id}`);
  }
  getPokemonSpecies(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon-species/${id}`);
  }

  getEvolutionChain(url: string): Observable<any> {
    return this.http.get(url);
  }
}
