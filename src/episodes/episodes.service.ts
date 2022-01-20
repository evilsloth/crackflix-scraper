import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { A4kScrapersService } from 'src/common/scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperEpisodeSearchParams } from 'src/common/scrapers/a4k-scrapers/scraper-episode-search-params';
import { ScraperSourceResolverService } from 'src/common/service/scraper-source-resolver.service';
import { FileLink } from '../common/model/file-link';
import { Source } from '../common/model/source';
import { EpisodeSearchParams } from './episode-search-params';

@Injectable()
export class EpisodesService {

    constructor(
        private a4kScrapersService: A4kScrapersService,
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

        return this.scraperSourceResolverService
            .getSources(scraper => this.a4kScrapersService.getEpisodes({ ...scraperParams, scraper }));
    }

    getStreamingLink(url: string, season?: number, episode?: number): Observable<FileLink> {
        if (season != null && episode != null) {
            const episodeRegex = new RegExp(`s0?${season}e0?${episode}(\\D|$)`, 'i'); // any other formats?
            return this.scraperSourceResolverService.getStreamingLink(url, link => episodeRegex.test(link.filename));
        } else {
            return this.scraperSourceResolverService.getStreamingLink(url);
        }
    }

}
