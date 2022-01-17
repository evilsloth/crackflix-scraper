import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { AllDebridResponse } from 'src/common/all-debrid/all-debrid-response';
import { AllDebridService } from 'src/common/all-debrid/all-debrid.service';
import { MagnetInstantStatus } from 'src/common/all-debrid/magnets/magnet-instant-status';
import { MagnetLinks } from 'src/common/all-debrid/magnets/magnet-links';
import { A4kScrapersService } from 'src/common/scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperEpisodeSearchParams } from 'src/common/scrapers/a4k-scrapers/scraper-episode-search-params';
import { ScraperEpisodeSource } from 'src/common/scrapers/a4k-scrapers/scraper-episode-source';
import { filterDuplicates, groupBy } from 'src/common/utils/array-utils';
import { EpisodeFileLink } from './episode-file-link';
import { EpisodeSearchParams } from './episode-search-params';
import { EpisodeSource } from './episode-source';

const VIDEO_EXTENSIONS = ['webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'avi', 'mp4', 'mts', 'm2ts', 'ts', 'mov', 'wmv',
    'rm', 'rmvb', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v', '3gp', 'divx', 'xvid']

@Injectable()
export class EpisodesService {

    constructor(private a4kScrapersService: A4kScrapersService, private allDebridService: AllDebridService) {
    }

    getEpisodeSources(searchParams: EpisodeSearchParams): Observable<EpisodeSource[]> {
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

        return this.a4kScrapersService.getScrapers().pipe(
            map(response => response.data),
            map(scrapers => scrapers.map(scraper => this.a4kScrapersService.getEpisodes({ ...scraperParams, scraper }))),
            switchMap(requests => forkJoin(requests)),
            map(responses => responses.reduce((array, response) => [...array, ...response.data], [])),
            map(sources => sources.filter(source => source.package === 'single')),
            map(sources => filterDuplicates(sources, (s1, s2) => s1.magnet === s2.magnet)),
            switchMap(sources => forkJoin([of(sources), this.getInstantStatuses(sources)])),
            map(([sources, instantStatuses]) => {
                const instantByMagnet = groupBy(instantStatuses, status => status.magnet);
                return sources.map(source => ({
                    title: source.release_title,
                    type: (instantByMagnet[source.hash] && instantByMagnet[source.hash][0]?.instant) ? 'cached_torrent' : 'torrent',
                    url: source.magnet,
                    scraper: source.scraper,
                    size: source.size,
                    seeds: source.seeds
                }));
            })
        );
    }

    getStreamingLink(url: string): Observable<EpisodeFileLink> {
        return this.allDebridService.uploadMagnet(url).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets[0]),
            switchMap(magnet => this.allDebridService.getMagnetStatus(magnet.id)),
            map(response => this.extractAllDebridResponseData(response).magnets),
            switchMap(status => this.allDebridService.getUnlockedLink(this.findVideoLink(status.links))),
            map(response => this.extractAllDebridResponseData(response)),
            map(link => ({
                fileName: link.filename,
                link: link.link,
                fileSize: link.filesize
            }))
        );
    }

    private findVideoLink(links: MagnetLinks[]): string {
        const found = links.find(link => VIDEO_EXTENSIONS.indexOf(link.filename.split('.').pop().toLowerCase()) !== -1);
        return found?.link || links[0].link;
    }

    private getInstantStatuses(sources: ScraperEpisodeSource[]): Observable<MagnetInstantStatus[]> {
        if (sources.length === 0) {
            return of([]);
        }

        return this.allDebridService.getMagnetsInstantStatuses(sources.map(source => source.hash)).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets)
        );
    }

    private extractAllDebridResponseData<T>(response: AxiosResponse<AllDebridResponse<T>>): T {
        if (response.status !== 200) {
            console.error('Service error', response.config.url, response.status, response.data);
            throw Error('Server error ' + response.status);
        }

        const data = response.data;
        if (data.status === 'success') {
            console.debug(response.config.url, data.data);
            return data.data;
        } else {
            console.error('All debrid api error', response.config.url, data.error);
            throw Error('All Debrid service error');
        }
    }

}
