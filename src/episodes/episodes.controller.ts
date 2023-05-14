import { CacheInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { FileLink } from '../common/model/file-link.dto';
import { Source } from '../common/model/source.dto';
import { EpisodeSearchParams } from './episode-search-params.dto';
import { EpisodesService } from './episodes.service';

@ApiTags('episodes')
@UseInterceptors(CacheInterceptor)
@Controller()
export class EpisodesController {

    constructor(private episodesService: EpisodesService) {}

    @Get('episodes')
    getEpisodeSources(@Query() searchParams: EpisodeSearchParams): Observable<Source[]> {
        return this.episodesService.getEpisodeSources(searchParams);
    }
    
    @Get('episodes/link')
    getEpisodeStreamingLink(
        @Query('season') season: number,
        @Query('episode') episode: number,
        @Query('magnet') magnet?: string,
        @Query('id') id?: number,
    ): Observable<FileLink> {
        if (magnet) {
            return this.episodesService.getStreamingLink(magnet, season, episode);
        } else if (id) {
            return this.episodesService.getStreamingLinkById(id, season, episode);
        }

        throw Error('One of "magnet" or "id" query param must be passed!');
    }

}
