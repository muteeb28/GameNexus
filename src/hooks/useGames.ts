import { IGameQuery } from "../App";
import useData from "./useData";
import { IGenre } from "./useGenres";
import { IPlatform } from "./usePlatform";

export interface Game {
  id: number;
  name: string;
  background_image: string;
  parent_platforms: { platform: IPlatform }[];
  metacritic: number;
  rating_top: number;
}

const useGames = (gameQuery: IGameQuery) => useData<Game>(
  '/games',
  {
    params: {
      genres: gameQuery.genre?.id,
      platform: gameQuery.platform?.id,
      ordering: gameQuery.sortOrder,
      search: gameQuery.searchText
    }
  },
  [gameQuery]
);

export default useGames;