import { CacheInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FileLink } from '../common/model/file-link';
import { Source } from '../common/model/source';
import { EpisodeSearchParams } from './episode-search-params';
import { EpisodesService } from './episodes.service';

@UseInterceptors(CacheInterceptor)
@Controller()
export class EpisodesController {

    constructor(private episodesService: EpisodesService) {}

    @Get('episodes')
    getEpisodeSources(@Query() searchParams: EpisodeSearchParams): Observable<Source[]> {
        return this.episodesService.getEpisodeSources(searchParams);
    }
    
    @Get('episodes/link')
    getStreamingLink(@Query('magnet') magnet: string): Observable<FileLink> {
        return this.episodesService.getStreamingLink(magnet).pipe(
            map(response => response)
        );
    }

}
