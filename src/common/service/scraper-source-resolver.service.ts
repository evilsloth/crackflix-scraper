import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AllDebridResponse } from 'src/common/all-debrid/all-debrid-response';
import { AllDebridService } from 'src/common/all-debrid/all-debrid.service';
import { MagnetInstantStatus } from 'src/common/all-debrid/magnets/magnet-instant-status';
import { FileLink } from 'src/common/model/file-link.dto';
import { Source } from 'src/common/model/source.dto';
import { A4kScrapersService } from 'src/common/scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperSource } from 'src/common/scrapers/a4k-scrapers/scraper-source';
import { filterDuplicates, groupBy } from 'src/common/utils/array-utils';
import { FileLinkFilter } from '../filters/file-link-filters';
import { DownloadInfo } from '../model/download-info.dto';
import { DownloadStatus } from '../model/download-status.dto';

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

    getStreamingLink(url: string, linkFilter: FileLinkFilter): Observable<FileLink> {
        return this.allDebridService.uploadMagnet(url).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets[0]),
            switchMap(magnet => this.getStreamingLinkById(magnet.id, linkFilter))
        );
    }

    getStreamingLinkById(id: number, linkFilter: FileLinkFilter): Observable<FileLink> {
        return this.getLinksById(id).pipe(
            switchMap(links => this.getUnlockedLink(this.findVideoLink(links, linkFilter)))
        );
    }

    getLinks(url: string): Observable<FileLink[]> {
        return this.allDebridService.uploadMagnet(url).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets[0]),
            switchMap(magnet => this.getLinksById(magnet.id))
        );
    }

    getLinksById(id: number): Observable<FileLink[]> {
        return this.allDebridService.getMagnetStatus(id).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets),
            map(status => status.links.map(link => ({
                fileName: link.filename,
                link: link.link,
                fileSize: link.size
            })))
        );
    }

    getUnlockedLink(link: string): Observable<FileLink> {
        return this.allDebridService.getUnlockedLink(link).pipe(
            map(response => this.extractAllDebridResponseData(response)),
            map(link => ({
                fileName: link.filename,
                link: link.link,
                fileSize: link.filesize
            }))
        );
    }

    startDownload(url: string): Observable<DownloadInfo> {
        return this.allDebridService.uploadMagnet(url).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets[0]),
            map(magnet => ({
                id: magnet.id,
                name: magnet.name,
                size: magnet.size,
                ready: magnet.ready
            }))
        );
    }

    getDownloadStatus(id: number): Observable<DownloadStatus> {
        return this.allDebridService.getMagnetStatus(id).pipe(
            map(response => this.extractAllDebridResponseData(response).magnets),
            map(status => ({
                id: status.id,
                filename: status.filename,
                size: status.size,
                status: status.status,
                statusCode: status.statusCode,
                downloaded: status.downloaded,
                uploaded: status.uploaded,
                seeders: status.seeders,
                downloadSpeed: status.downloadSpeed,
                uploadSpeed: status.uploadSpeed,
                uploadDate: status.uploadDate,
                completionDate: status.completionDate
            }))
        );
    }

    private findVideoLink(links: FileLink[], filter: FileLinkFilter): string {
        const found = links.filter(filter || (link => link));

        // biggest first (in case of samples in package)
        found.sort((a, b) => b.fileSize - a.fileSize);
        if (found.length > 0) {
            return found[0]?.link;
        }

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
            throw Error('Server error ' + response.status);
        }

        const data = response.data;
        if (data.status === 'success') {
            return data.data;
        } else {
            throw Error('All Debrid service error');
        }
    }

}
