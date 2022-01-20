import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AllDebridResponse } from 'src/common/all-debrid/all-debrid-response';
import { AllDebridService } from 'src/common/all-debrid/all-debrid.service';
import { MagnetInstantStatus } from 'src/common/all-debrid/magnets/magnet-instant-status';
import { MagnetLinks } from 'src/common/all-debrid/magnets/magnet-links';
import { FileLink } from 'src/common/model/file-link';
import { Source } from 'src/common/model/source';
import { A4kScrapersService } from 'src/common/scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperSource } from 'src/common/scrapers/a4k-scrapers/scraper-source';
import { filterDuplicates, groupBy } from 'src/common/utils/array-utils';

const VIDEO_EXTENSIONS = ['webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'avi', 'mp4', 'mts', 'm2ts', 'ts', 'mov', 'wmv',
    'rm', 'rmvb', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v', '3gp', 'divx', 'xvid']

@Injectable()
export class ScraperSourceResolverService {

    constructor(private a4kScrapersService: A4kScrapersService, private allDebridService: AllDebridService) {
    }

    getSources(searchResultsGetter: (scrapper: string) => Observable<AxiosResponse<ScraperSource[]>>): Observable<Source[]> {
        return this.a4kScrapersService.getScrapers().pipe(
            map(response => response.data),
            map(scrapers => scrapers.map(scraper => searchResultsGetter(scraper))),
            switchMap(requests => forkJoin(requests)),
            map(responses => responses.reduce((array, response) => [...array, ...response.data], [])),
            map(sources => filterDuplicates(sources, (s1, s2) => s1.magnet === s2.magnet)),
            switchMap(sources => forkJoin([of(sources), this.getInstantStatuses(sources)])),
            map(([sources, instantStatuses]) => {
                const instantByMagnet = groupBy(instantStatuses, status => status.magnet);
                return sources.map(source => ({
                    title: source.release_title,
                    type: (instantByMagnet[source.hash] && instantByMagnet[source.hash][0]?.instant) ? 'cached_torrent' : 'torrent',
                    url: source.magnet,
                    scraper: source.scraper || source.provider_name_override,
                    package: source.package,
                    size: source.size,
                    seeds: source.seeds
                }));
            })
        );
    }

    getStreamingLink(url: string, linkFilter: (link: MagnetLinks) => boolean = null): Observable<FileLink> {
        return this.allDebridService.uploadMagnet(url).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets[0]),
            switchMap(magnet => this.allDebridService.getMagnetStatus(magnet.id)),
            map(response => this.extractAllDebridResponseData(response).magnets),
            switchMap(status => this.allDebridService.getUnlockedLink(this.findVideoLink(status.links, linkFilter))),
            map(response => this.extractAllDebridResponseData(response)),
            map(link => ({
                fileName: link.filename,
                link: link.link,
                fileSize: link.filesize
            }))
        );
    }

    private findVideoLink(links: MagnetLinks[], filter: (link: MagnetLinks) => boolean): string {
        const found = links
            .filter(link => VIDEO_EXTENSIONS.indexOf(link.filename.split('.').pop().toLowerCase()) !== -1)
            .filter(filter || (link => link));

        // biggest first (in case of samples in package)
        found.sort((a, b) => b.size - a.size);
        if (found.length > 0) {
            return found[0]?.link;
        }

        console.error('Reolve error', links);
        throw Error('Could not resolve video stream link');
    }

    private getInstantStatuses(sources: ScraperSource[]): Observable<MagnetInstantStatus[]> {
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
