import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DownloadInfo } from 'src/common/model/download-info';
import { DownloadStatus } from 'src/common/model/download-status';
import { FileLink } from 'src/common/model/file-link';
import { ScraperSourceResolverService } from 'src/common/service/scraper-source-resolver.service';
import { DownloadRequest } from './download-request';

@Controller()
export class FilesController {

    constructor(private scraperSourceResolverService: ScraperSourceResolverService) { }

    @Post('files/download/start')
    startDownload(@Body() request: DownloadRequest): Observable<DownloadInfo> {
        return this.scraperSourceResolverService.startDownload(request.url);
    }

    @Get('files/download/status')
    getDownloadStatus(@Query('id') id: number): Observable<DownloadStatus> {
        return this.scraperSourceResolverService.getDownloadStatus(id);
    }

    @Get('files/links')
    getLinks(@Query('magnet') magnet: string, @Query('id') id: number): Observable<FileLink[]> {
        if (magnet) {
            return this.scraperSourceResolverService.getLinks(magnet);
        } else if (id) {
            return this.scraperSourceResolverService.getLinksById(id);
        }

        throw Error('One of "magnet" or "id" query param must be passed!');
    }

    @Get('files/links/:link/unlocked')
    getUnlockedLink(@Param('link') link: string): Observable<FileLink> {
        return this.scraperSourceResolverService.getUnlockedLink(link);
    }

}
