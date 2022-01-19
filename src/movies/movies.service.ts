import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileLink } from 'src/common/model/file-link';
import { Source } from 'src/common/model/source';
import { A4kScrapersService } from 'src/common/scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperMovieSearchParams } from 'src/common/scrapers/a4k-scrapers/scraper-movie-search-params';
import { ScraperSourceResolverService } from 'src/common/service/scraper-source-resolver.service';
import { MovieSearchParams } from './movie-search-params';

@Injectable()
export class MoviesService {

    constructor(
        private a4kScrapersService: A4kScrapersService,
        private scraperSourceResolverService: ScraperSourceResolverService) {
    }

    getEpisodeSources(searchParams: MovieSearchParams): Observable<Source[]> {
        const scraperParams: ScraperMovieSearchParams = {
            title: searchParams.title,
            year: searchParams.year,
            imdb: searchParams.imdb
        };

        return this.scraperSourceResolverService
            .getSources(scraper => this.a4kScrapersService.getMovies({ ...scraperParams, scraper }));
    }

    getStreamingLink(url: string): Observable<FileLink> {
        return this.scraperSourceResolverService.getStreamingLink(url);
    }

}
