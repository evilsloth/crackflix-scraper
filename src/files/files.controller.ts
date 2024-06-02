import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { DownloadInfo } from '../common/model/download-info.dto';
import { DownloadStatus } from '../common/model/download-status.dto';
import { FileLink } from '../common/model/file-link.dto';
import { ScraperSourceResolverService } from '../common/service/scraper-source-resolver.service';
import { DownloadRequest } from './download-request.dto';

@ApiTags('files')
@ApiSecurity('apiKey')
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
