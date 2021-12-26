export interface EpisodeSource {
    title: string;
    type: 'torrent' | 'cached_torrent';
    url: string;
    scraper: string;
    size: number;
    seeds: number;
}