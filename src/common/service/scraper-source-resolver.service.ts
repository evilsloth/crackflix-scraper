import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AllDebridResponse } from '../../common/all-debrid/all-debrid-response';
import { AllDebridService } from '../../common/all-debrid/all-debrid.service';
import { MagnetInstantStatus } from '../../common/all-debrid/magnets/magnet-instant-status';
import { FileLink } from '../../common/model/file-link.dto';
import { Source } from '../../common/model/source.dto';
import { ScraperSource } from '../../common/scrapers/common/scraper-source';
import { filterDuplicates, groupBy } from '../../common/utils/array-utils';
import { FileLinkFilter } from '../filters/file-link-filters';
import { DownloadInfo } from '../model/download-info.dto';
import { DownloadStatus } from '../model/download-status.dto';

@Injectable()
export class ScraperSourceResolverService {

    constructor(private allDebridService: AllDebridService) { }

    getSources(searchResults: Observable<ScraperSource[]>[]): Observable<Source[]> {
        const results = forkJoin(searchResults).pipe(
            map(res => [].concat(...res))
        );

        return results.pipe(
            map(sources => filterDuplicates(sources, (s1, s2) => s1.hash === s2.hash)),
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

        const hashes = sources.map(source => source.hash);

        const chunkSize = 100;
        const chunkObservables: Observable<MagnetInstantStatus[]>[] = [];
        for (let i = 0; i < hashes.length; i += chunkSize) {
            const hashesChunk = hashes.slice(i, i + chunkSize);
            const chunkObservable = this.allDebridService.getMagnetsInstantStatuses(hashesChunk).pipe(
                map(response => this.extractAllDebridResponseData(response).magnets)
            );
            chunkObservables.push(chunkObservable);
        }

        return forkJoin(chunkObservables).pipe(
            map(responses => [].concat(...responses))
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
