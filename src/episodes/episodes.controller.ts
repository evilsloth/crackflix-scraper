import { CacheInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AllDebridService } from 'src/common/all-debrid/all-debrid.service';
import { EpisodeFileLink } from './episode-file-link';
import { EpisodeSearchParams } from './episode-search-params';
import { EpisodeSource } from './episode-source';
import { EpisodesService } from './episodes.service';

@UseInterceptors(CacheInterceptor)
@Controller()
export class EpisodesController {

    constructor(private episodesService: EpisodesService, private allDebridService: AllDebridService) {}

    @Get('episodes')
    getEpisodeSources(@Query() searchParams: EpisodeSearchParams): Observable<EpisodeSource[]> {
        return this.episodesService.getEpisodeSources(searchParams);
    }
    
    @Get('episodes/link')
    getStreamingLink(@Query('magnet') magnet: string): Observable<EpisodeFileLink> {
        return this.episodesService.getStreamingLink(magnet).pipe(
            map(response => response)
        );
    }

}
