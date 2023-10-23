import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PokemonDetail } from 'src/app/interfaces/pokemon-detail.interface';
import { FilterData } from 'src/app/interfaces/pokemon-filter.interface';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  pokemons: any[] = [];
  currentPage: number = 1;
  pokemonsPerPage: number = 20;
  filteredPokemons: any[] = [];
  isLoading: boolean = true;
  placeholders: number[] = Array(20).fill(0);
  displayedPokemons: any[] = [];

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.fetchAllPokemons();
  }

  fetchAllPokemons(): void {
    this.pokemonService.getAllPokemons().subscribe(response => {
      this.processPokemonListResponse(response.results);
    });
  }

  processPokemonListResponse(pokemonList: any[]): void {
    const pokemonDetailsObservables = pokemonList.map(pokemon => this.pokemonService.getPokemonDetails(pokemon.name));
    forkJoin(pokemonDetailsObservables).subscribe((pokemonDetails: PokemonDetail[]) => {
      this.pokemons = pokemonDetails.filter(pokemon => pokemon.id <= 1010);
      this.filteredPokemons = [...this.pokemons];
      this.updateDisplayedPokemons();
      this.isLoading = false;
    });
  }

  updateDisplayedPokemons(): void {
    this.currentPage = 1;
    const start = (this.currentPage - 1) * this.pokemonsPerPage;
    const end = start + this.pokemonsPerPage;
    this.displayedPokemons = this.filteredPokemons.slice(start, end);
  }

  filterPokemons(filter: FilterData): void {
    const { searchTerm, selectedType1, selectedType2, generation } = filter;
    this.filteredPokemons = this.pokemons;

    if(generation && generation !== 'all') {
      this.filterByGeneration(Number(generation), searchTerm, selectedType1, selectedType2);
    } else {
      this.filterByNameAndType(searchTerm, selectedType1, selectedType2);
    }

  }

  filterByGeneration(generation: number, searchTerm: string, selectedType1: string, selectedType2: string): void {
    if (generation <= 0) {
      return;
    }
    this.pokemonService.getGenerationPokemons(generation).subscribe(response => {
      const generationPokemonNames = response.pokemon_species.map(species => species.name);
      this.filteredPokemons = this.pokemons.filter(pokemon => generationPokemonNames.includes(pokemon.name));
      this.filterByNameAndType(searchTerm, selectedType1, selectedType2);
    });
  }

  filterByNameAndType(searchTerm: string, selectedType1: string, selectedType2: string): void {
    this.filterByName(searchTerm);
    this.filterByType(selectedType1 || 'all', selectedType2 || 'all');
    this.updateDisplayedPokemons();
}


  filterByName(searchTerm: string): void {
    if (searchTerm) {
      if (!isNaN(Number(searchTerm))) {
        const id = Number(searchTerm);
        this.filteredPokemons = this.filteredPokemons.filter(pokemon => pokemon.id === id);
      } else {
        this.filteredPokemons = this.filteredPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
    }
  }

  filterByType(selectedType1: string, selectedType2: string): void {
    if (selectedType1 !== 'all' || selectedType2 !== 'all') {
      this.filteredPokemons = this.filteredPokemons.filter(pokemon => {
        const typeNames = this.getPokemonTypes(pokemon);
        return (selectedType1 === 'all' || typeNames.includes(selectedType1)) &&
               (selectedType2 === 'all' || typeNames.includes(selectedType2));
      });
    }
  }

  getDisplayedPokemons(): any[] {
    const start = (this.currentPage - 1) * this.pokemonsPerPage;
    const end = start + this.pokemonsPerPage;
    return this.filteredPokemons.slice(start, end);
  }

  getPokemonTypes(pokemon: any): string[] {
    return pokemon.types.map((type: any) => type.type.name);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredPokemons.length / this.pokemonsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    } else {
      this.currentPage = 1;
    }
    this.loadDisplayedPokemons();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    } else {
      this.currentPage = this.getTotalPages();
    }
    this.loadDisplayedPokemons();
  }

  goToPage(): void {
    if (this.currentPage <= 0) {
      this.currentPage = 1;
    } else {
      const totalPages = this.getTotalPages();
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
    }
    this.loadDisplayedPokemons();
  }

  loadDisplayedPokemons(): void {
    const start = (this.currentPage - 1) * this.pokemonsPerPage;
    const end = start + this.pokemonsPerPage;
    this.displayedPokemons = this.filteredPokemons.slice(start, end);
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
}

