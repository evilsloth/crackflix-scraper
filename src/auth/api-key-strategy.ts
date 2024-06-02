import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {

    private readonly logger = new Logger(ApiKeyStrategy.name);

    constructor(configService: ConfigService) {
        const configuredApiKey = configService.get<string>('API_KEY');

        super({ header: 'apiKey', prefix: '' }, true, (apikey, done, req) => {
            const keyValid = !configuredApiKey || apikey === configuredApiKey;
            if (!keyValid) {
                return done(false);
            }
            
            return done(true);
        });

        if (!configuredApiKey) {
            this.logger.warn('API_KEY was not set! Api key validation will not be performed!');
        }
    }
}