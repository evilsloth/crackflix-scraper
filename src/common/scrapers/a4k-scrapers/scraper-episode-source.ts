export interface ScraperEpisodeSource {
    hash: string,
    magnet: string,
    package: 'season' | 'single',
    release_title: string,
    scraper: string,
    seeds: number,
    size: number
}