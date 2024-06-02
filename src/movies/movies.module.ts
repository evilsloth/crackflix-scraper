import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
    imports: [CommonModule],
    controllers: [MoviesController],
    providers: [MoviesService]
})
export class MoviesModule {}
