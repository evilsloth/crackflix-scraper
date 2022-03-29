import { CacheInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FileLink } from '../common/model/file-link';
import { Source } from '../common/model/source';
import { MovieSearchParams } from './movie-search-params';
import { MoviesService } from './movies.service';

@UseInterceptors(CacheInterceptor)
@Controller()
export class MoviesController {

    constructor(private moviesService: MoviesService) {}

    @Get('movies')
    getEpisodeSources(@Query() searchParams: MovieSearchParams): Observable<Source[]> {
        return this.moviesService.getEpisodeSources(searchParams);
    }
    
    @Get('movies/link')
    getStreamingLink(
        @Query('magnet') magnet?: string,
        @Query('id') id?: number
    ): Observable<FileLink> {
        if (magnet) {
            return this.moviesService.getStreamingLink(magnet);
        } else if (id) {
            return this.moviesService.getStreamingLinkById(id);
        }

        throw Error('One of "magnet" or "id" query param must be passed!');
    }

}
