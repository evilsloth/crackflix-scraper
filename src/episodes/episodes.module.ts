import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';

@Module({
    imports: [CommonModule],
    controllers: [EpisodesController],
    providers: [EpisodesService]
})
export class EpisodesModule {}
