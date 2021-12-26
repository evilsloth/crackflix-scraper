import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AllDebridService } from './all-debrid/all-debrid.service';
import { A4kScrapersService } from './scrapers/a4k-scrapers/a4k-scrapers.service';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [A4kScrapersService, AllDebridService],
    exports: [A4kScrapersService, AllDebridService]
})
export class CommonModule {

}