import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VIDEO_FILE_LINK_FILTER } from '../common/filters/file-link-filters';
import { FileLink } from '../common/model/file-link.dto';
import { Source } from '../common/model/source.dto';
import { ScraperMovieSearchParams } from '../common/scrapers/common/scraper-movie-search-params';
import { ScraperService } from '../common/scrapers/common/scraper.service';
import { ScraperSourceResolverService } from '../common/service/scraper-source-resolver.service';
import { MovieSearchParams } from './movie-search-params.dto';

@Injectable()
export class MoviesService {

    constructor(
        @Inject('SCRAPER_SERVICES') private scraperServices: ScraperService[],
        private scraperSourceResolverService: ScraperSourceResolverService) {
    }

    getEpisodeSources(searchParams: MovieSearchParams): Observable<Source[]> {
        const scraperParams: ScraperMovieSearchParams = {
            title: searchParams.title,
            year: searchParams.year,
            imdb: searchParams.imdb
        };

        const sources = this.scraperServices.map((service) => service.getMovies(scraperParams));
        return this.scraperSourceResolverService.getSources(sources);
    }

    getStreamingLink(url: string): Observable<FileLink> {
        return this.scraperSourceResolverService.getStreamingLink(url, VIDEO_FILE_LINK_FILTER);
    }

    getStreamingLinkById(id: number): Observable<FileLink> {
        return this.scraperSourceResolverService.getStreamingLinkById(id, VIDEO_FILE_LINK_FILTER);
    }

}
