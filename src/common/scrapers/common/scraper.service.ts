import { Observable } from 'rxjs';
import { ScraperEpisodeSearchParams } from './scraper-episode-search-params';
import { ScraperSource } from './scraper-source';
import { ScraperMovieSearchParams } from './scraper-movie-search-params';

export const SCRAPER_SERVICES = 'SCRAPER_SERVICES';

export interface ScraperService {
    getEpisodes(params: ScraperEpisodeSearchParams): Observable<ScraperSource[]>;
    getMovies(params: ScraperMovieSearchParams): Observable<ScraperSource[]>;
}