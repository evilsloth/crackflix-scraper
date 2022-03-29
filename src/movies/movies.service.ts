import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VIDEO_FILE_LINK_FILTER } from 'src/common/filters/file-link-filters';
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
        return this.scraperSourceResolverService.getStreamingLink(url, VIDEO_FILE_LINK_FILTER);
    }
    
    getStreamingLinkById(id: number): Observable<FileLink> {
        return this.scraperSourceResolverService.getStreamingLinkById(id, VIDEO_FILE_LINK_FILTER);
    }

}
