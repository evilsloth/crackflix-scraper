export interface Source {
    title: string;
    type: 'torrent' | 'cached_torrent';
    url: string;
    scraper: string;
    package: 'single' | 'season' | 'show';
    size: number;
    seeds: number;
}