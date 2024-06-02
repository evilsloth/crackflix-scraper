import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { ScraperEpisodeSearchParams } from '../common/scraper-episode-search-params';
import { ScraperMovieSearchParams } from '../common/scraper-movie-search-params';
import { ScraperSource } from '../common/scraper-source';
import { ScraperService } from '../common/scraper.service';

@Injectable()
export class A4kScrapersService implements ScraperService {

    private baseUrl: string;

    constructor(private http: HttpService, configService: ConfigService) {
        this.baseUrl = configService.get<string>('A4K_SCRAPER_BASE_URL');
    }

    getEpisodes(params: ScraperEpisodeSearchParams): Observable<ScraperSource[]> {
        return this.getScrapers().pipe(
            map(scrapers => scrapers.map(scraper => this.getEpisodesForScraper(params, scraper))),
            switchMap(requests => forkJoin(requests)),
            map(responses => responses.reduce((array, response) => [...array, ...response], []))
        );
    }

    getMovies(params: ScraperMovieSearchParams): Observable<ScraperSource[]> {
        return this.getScrapers().pipe(
            map(scrapers => scrapers.map(scraper => this.getMoviesForScraper(params, scraper))),
            switchMap(requests => forkJoin(requests)),
            map(responses => responses.reduce((array, response) => [...array, ...response], []))
        );
    }

    private getScrapers(): Observable<string[]> {
        return this.http.get(this.baseUrl + '/scrapers').pipe(map((response) => response.data));
    }

    private getEpisodesForScraper(params: ScraperEpisodeSearchParams, scraper: string): Observable<ScraperSource[]> {
        return this.http.get(this.baseUrl + '/episodes', { params: { ...params, scraper } }).pipe(
            map((response) => this.mapSources(response.data))
        );
    }

    private getMoviesForScraper(params: ScraperMovieSearchParams, scraper: string): Observable<ScraperSource[]> {
        return this.http.get(this.baseUrl + '/movies', { params: { ...params, scraper } }).pipe(
            map((response) => this.mapSources(response.data))
        );
    }

    private mapSources(sources: ScraperSource[]): ScraperSource[] {
        return sources.map((source) => ({
            ...source,
            scraper: (source.scraper || source.provider_name_override) + ' (a4k)'
        }));
    }

}