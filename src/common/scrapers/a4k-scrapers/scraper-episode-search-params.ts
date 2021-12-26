export interface ScraperEpisodeSearchParams {
    show_title: string;
    show_aliases?: string[];
    episode_title?: string;
    year?: string;
    season: number;
    episode: number;
    imdb?: string;
    country?: string;
    seasons?: number;
    scraper?: string; /* All when null */
}