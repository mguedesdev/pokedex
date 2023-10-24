import { PokemonAbility } from './pokemon-ability.interface';

export interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
    }
  }>;
  abilities: PokemonAbility[];
}
