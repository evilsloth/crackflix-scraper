import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AllDebridService } from './all-debrid/all-debrid.service';
import { HttpLoggerService } from './logging/http-logger.service';
import { A4kScrapersService } from './scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperSourceResolverService } from './service/scraper-source-resolver.service';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [
        HttpLoggerService,
        A4kScrapersService,
        AllDebridService,
        ScraperSourceResolverService
    ],
    exports: [
        HttpLoggerService,
        A4kScrapersService,
        AllDebridService,
        ScraperSourceResolverService
    ]
})
export class CommonModule {
}