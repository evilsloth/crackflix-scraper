import { ApiProperty } from '@nestjs/swagger';

export class Source {
    title: string;
    @ApiProperty({ enum: ['torrent', 'cached_torrent'] }) type: 'torrent' | 'cached_torrent';
    url: string;
    scraper: string;
    @ApiProperty({ enum: ['single', 'season', 'show'] }) package: 'single' | 'season' | 'show';
    size: number;
    seeds: number;
}