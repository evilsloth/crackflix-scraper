import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ScraperEpisodeSearchParams } from './scraper-episode-search-params';
import { ScraperSource } from './scraper-source';
import { ScraperMovieSearchParams } from './scraper-movie-search-params';

@Injectable()
export class A4kScrapersService {

    private baseUrl: string;

    constructor(private http: HttpService, configService: ConfigService) {
        this.baseUrl = configService.get<string>('A4K_SCRAPER_BASE_URL');
    }

    getEpisodes(params: ScraperEpisodeSearchParams): Observable<AxiosResponse<ScraperSource[]>> {
        return this.http.get(this.baseUrl + '/episodes', { params });
    }

    getMovies(params: ScraperMovieSearchParams): Observable<AxiosResponse<ScraperSource[]>> {
        return this.http.get(this.baseUrl + '/movies', { params });
    }

    getScrapers(): Observable<AxiosResponse<string[]>> {
        return this.http.get(this.baseUrl + '/scrapers');
    }

}