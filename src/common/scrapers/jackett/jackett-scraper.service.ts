import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';
import { Observable, map } from 'rxjs';
import { ScraperEpisodeSearchParams } from '../common/scraper-episode-search-params';
import { ScraperMovieSearchParams } from '../common/scraper-movie-search-params';
import { ScraperSource } from '../common/scraper-source';
import { ScraperService } from '../common/scraper.service';

@Injectable()
export class JackettScraperService implements ScraperService {

    private baseUrl: string;

    private apiKey: string;

    private xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });

    constructor(private http: HttpService, configService: ConfigService) {
        this.baseUrl = configService.get<string>('JACKETT_BASE_URL') + '/api/v2.0/indexers/all/results/torznab/api';
        this.apiKey = configService.get<string>('JACKETT_API_KEY');
    }

    getEpisodes(params: ScraperEpisodeSearchParams): Observable<ScraperSource[]> {
        return this.searchEpisodeSources(params.show_title, params.season, params.episode).pipe(
            map((data) => this.getScraperSources(data.rss.channel.item))
        );
    }

    getMovies(params: ScraperMovieSearchParams): Observable<ScraperSource[]> {
        return this.searchMovieSources(params.title, params.year).pipe(
            map((data) => this.getScraperSources(data.rss.channel.item))
        );
    }

    private searchEpisodeSources(query: string, season: number, episode: number): Observable<any> {
        return this.http.get(this.baseUrl, {
            responseType: 'document',
            params: {
                apikey: this.apiKey,
                t: 'tvsearch',
                q: query,
                season: season,
                ep: episode
            }
        }).pipe(
            map((response) => response.data),
            map((data) => this.xmlParser.parse(data))
        );
    }

    private searchMovieSources(query: string, year: string): Observable<any> {
        return this.http.get(this.baseUrl, {
            responseType: 'document',
            params: {
                apikey: this.apiKey,
                t: 'movie',
                q: query,
                year: year
            }
        }).pipe(
            map((response) => response.data),
            map((data) => this.xmlParser.parse(data))
        );
    }

    private findAttributeValue(item: any, attrName: string): string | null {
        const attribs = item['torznab:attr'];
        if (!attribs) {
            return null;
        }

        const attribute = attribs.find((attr) => attr['@name'] === attrName);
        return attribute != null ? attribute['@value'] : null;
    }

    private getScraperSources(items: any[]): ScraperSource[] {
        return items
            .map((item) => this.toScraperSource(item))
            .filter((source: ScraperSource) => source.hash != null);
    }

    private toScraperSource(item: any): ScraperSource {
        return {
            hash: this.findAttributeValue(item, 'infohash'),
            magnet: this.findAttributeValue(item, 'magneturl'),
            package: 'single',
            release_title: item.title,
            scraper: item.jackettindexer['#text'] + ' (jackett)',
            seeds: +this.findAttributeValue(item, 'seeders'),
            size: Math.round(+item.size / 1048576)
        };
    }

}