export interface ScraperMovieSearchParams {
    title: string;
    year: string;
    imdb?: string;
    scraper?: string; /* All when null */
}