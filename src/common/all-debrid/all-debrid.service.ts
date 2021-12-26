import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { AllDebridResponse } from './all-debrid-response';
import { UnlockedLink } from './links/unlocked-link';
import { MagnetsInstantStatuses } from './magnets/magnets-instant-statuses';
import { MagnetsSingleStatus } from './magnets/magnets-statuses';
import { MagnetsUploadStatuses } from './magnets/magnets-upload-statuses';

@Injectable()
export class AllDebridService {

    private baseUrl: string;
    private apiParams: { [key: string]: string };

    constructor(private http: HttpService, configService: ConfigService) {
        this.baseUrl = configService.get<string>('ALL_DEBRID_BASE_URL');
        this.apiParams = {
            apikey: configService.get<string>('ALL_DEBRID_API_KEY'),
            agent: configService.get<string>('ALL_DEBRID_AGENT')
        };
    }

    uploadMagnet(magnet: string): Observable<AxiosResponse<AllDebridResponse<MagnetsUploadStatuses>>> {
        return this.http.get(this.baseUrl + '/magnet/upload', { params: { ...this.apiParams, magnets: [magnet] } });
    }

    getMagnetStatus(id: number): Observable<AxiosResponse<AllDebridResponse<MagnetsSingleStatus>>> {
        return this.http.get(this.baseUrl + '/magnet/status', { params: { ...this.apiParams, id } });
    }

    getMagnetsInstantStatuses(magnets: string[]): Observable<AxiosResponse<AllDebridResponse<MagnetsInstantStatuses>>> {
        return this.http.get(this.baseUrl + '/magnet/instant', { params: { ...this.apiParams, magnets } });
    }

    getUnlockedLink(link: string): Observable<AxiosResponse<AllDebridResponse<UnlockedLink>>> {
        return this.http.get(this.baseUrl + '/link/unlock', { params: { ...this.apiParams, link } });
    }

}