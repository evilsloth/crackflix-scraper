import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileLinkFilter, VIDEO_FILE_LINK_FILTER, combinedFilter, episodeFilter } from '../common/filters/file-link-filters';
import { FileLink } from '../common/model/file-link.dto';
import { Source } from '../common/model/source.dto';
import { ScraperEpisodeSearchParams } from '../common/scrapers/common/scraper-episode-search-params';
import { ScraperService } from '../common/scrapers/common/scraper.service';
import { ScraperSourceResolverService } from '../common/service/scraper-source-resolver.service';
import { EpisodeSearchParams } from './episode-search-params.dto';

@Injectable()
export class EpisodesService {

    constructor(
        @Inject('SCRAPER_SERVICES') private scraperServices: ScraperService[],
        private scraperSourceResolverService: ScraperSourceResolverService) {
    }

    getEpisodeSources(searchParams: EpisodeSearchParams): Observable<Source[]> {
        const scraperParams: ScraperEpisodeSearchParams = {
            show_title: searchParams.showTitle,
            episode_title: searchParams.episodeTitle,
            year: searchParams.year,
            season: searchParams.season,
            episode: searchParams.episode,
            show_aliases: searchParams.showAliases,
            country: searchParams.country,
            seasons: searchParams.numberOfSeasons,
            imdb: searchParams.imdb
        };

        const sources = this.scraperServices.map((service) => service.getEpisodes(scraperParams));
        return this.scraperSourceResolverService.getSources(sources);
    }

    getStreamingLink(url: string, season: number, episode: number): Observable<FileLink> {
        const filter: FileLinkFilter = combinedFilter(VIDEO_FILE_LINK_FILTER, episodeFilter(season, episode));
        return this.scraperSourceResolverService.getStreamingLink(url, filter);
    }

    getStreamingLinkById(id: number, season: number, episode: number): Observable<FileLink> {
        const filter: FileLinkFilter = combinedFilter(VIDEO_FILE_LINK_FILTER, episodeFilter(season, episode));
        return this.scraperSourceResolverService.getStreamingLinkById(id, filter);
    }

}
