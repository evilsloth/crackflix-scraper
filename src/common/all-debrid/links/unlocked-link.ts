import { UnlockedLinkStream } from './unlocked-link-stream';

export interface UnlockedLink {
    link: string;
    host: string;
    filename: string;
    filesize: number;
    streams: UnlockedLinkStream[];
    id: number;
    hostDomain: string;
    delayed: number;
}