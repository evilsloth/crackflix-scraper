import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class HttpLoggerService {

    private readonly logger = new Logger(HttpLoggerService.name);

    constructor(private http: HttpService) {
    }

    init() {
        this.http.axiosRef.interceptors.request.use((config) => {
            config['requestId'] = randomUUID();
            const requestData = {
                requestId: config['requestId'],
                method: config.method,
                url: config.url,
                params: config.params,
                // data: config.data, // uncomment for debugging
                headers: config.headers
            };
            this.logger.debug('Request: ' + JSON.stringify(requestData));
            return config;
        }, (error) => {
            this.logger.debug('Request error: ' + JSON.stringify(error));
            return Promise.reject(error);
        });

        this.http.axiosRef.interceptors.response.use((response) => {
            const responseData = {
                requestId: response.config['requestId'],
                method: response.config.method,
                url: response.config.url,
                params: response.config.params,
                status: response.status,
                statusText: response.statusText,
                // data: response.data, // uncomment for debugging
                headers: response.headers
            };
            this.logger.debug('Response: ' + JSON.stringify(responseData));
            return response;
        }, (error) => {
            this.logger.debug('Response error: ' + JSON.stringify(error));
            return Promise.reject(error);
        });
    }

}