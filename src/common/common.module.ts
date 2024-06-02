import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AllDebridService } from './all-debrid/all-debrid.service';
import { HttpLoggerService } from './logging/http-logger.service';
import { A4kScrapersService } from './scrapers/a4k-scrapers/a4k-scrapers.service';
import { ScraperSourceResolverService } from './service/scraper-source-resolver.service';
import { JackettScraperService } from './scrapers/jackett/jackett-scraper.service';
import { SCRAPER_SERVICES } from './scrapers/common/scraper.service';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [
        HttpLoggerService,
        AllDebridService,
        ScraperSourceResolverService,
        A4kScrapersService,
        JackettScraperService,
        {
            provide: SCRAPER_SERVICES,
            useFactory: (...services) => [...services],
            inject: [A4kScrapersService, JackettScraperService]
        }
    ],
    exports: [
        HttpLoggerService,
        AllDebridService,
        ScraperSourceResolverService,
        A4kScrapersService,
        JackettScraperService,
        SCRAPER_SERVICES
    ]
})
export class CommonModule {
}