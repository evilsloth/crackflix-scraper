import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DownloadInfo } from 'src/common/model/download-info';
import { DownloadStatus } from 'src/common/model/download-status';
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

}
