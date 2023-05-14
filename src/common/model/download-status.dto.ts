export class DownloadStatus {
    id: number;
    filename: string;
    size: number;
    status: string;
    statusCode: number;
    downloaded: number;
    uploaded: number;
    seeders: number;
    downloadSpeed: number;
    uploadSpeed: number;
    uploadDate: number;
    completionDate: number;
}