export interface ScraperSource {
    hash: string,
    magnet: string,
    package: 'single' | 'season' | 'show',
    release_title: string,
    scraper?: string,
    provider_name_override?: string,
    seeds: number,
    size: number
}