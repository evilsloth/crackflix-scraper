import { FileLink } from '../model/file-link';

export type FileLinkFilter = (fileLink: FileLink) => boolean;

const VIDEO_EXTENSIONS = ['webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'avi', 'mp4', 'mts', 'm2ts', 'ts', 'mov', 'wmv',
    'rm', 'rmvb', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v', '3gp', 'divx', 'xvid'];

export const VIDEO_FILE_LINK_FILTER: FileLinkFilter = (fileLink: FileLink) => {
    return VIDEO_EXTENSIONS.indexOf(fileLink.fileName.split('.').pop().toLowerCase()) !== -1;
}

export function episodeFilter(season: number, episode: number): FileLinkFilter {
    // any other formats?
    const episodeRegexes = [
        new RegExp(`s0?${season}e0?${episode}(\\D|$)`, 'i'), // s01e02
        new RegExp(`(\\D|^)0?${season}x0?${episode}(\\D|$)`, 'i'), // 1x2
        new RegExp(`(\\D|^)${season}${episode.toString().padStart(2, '0')}(\\D|$)`, 'i') // 102
    ];
    return (fileLink: FileLink) => episodeRegexes.some(regex => regex.test(fileLink.fileName));
}

export function combinedFilter(...filters: FileLinkFilter[]): FileLinkFilter {
    return link => filters.every(filter => filter(link))
}