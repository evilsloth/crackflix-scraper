import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { FileLink } from '../common/model/file-link.dto';
import { Source } from '../common/model/source.dto';
import { MovieSearchParams } from './movie-search-params.dto';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@ApiSecurity('apiKey')
@UseInterceptors(CacheInterceptor)
@Controller()
export class MoviesController {

    constructor(private moviesService: MoviesService) { }

    @Get('movies')
    getMovieSources(@Query() searchParams: MovieSearchParams): Observable<Source[]> {
        return this.moviesService.getEpisodeSources(searchParams);
    }

    @Get('movies/link')
    getMovieStreamingLink(
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
