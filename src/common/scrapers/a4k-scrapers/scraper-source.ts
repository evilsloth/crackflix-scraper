export interface ScraperSource {
    hash: string,
    magnet: string,
    package: 'season' | 'single',
    release_title: string,
    scraper?: string,
    provider_name_override?: string,
    seeds: number,
    size: number
}