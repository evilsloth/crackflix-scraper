import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { FilesController } from './files.controller';

@Module({
    imports: [CommonModule],
    controllers: [FilesController],
    providers: []
})
export class FilesModule {}
