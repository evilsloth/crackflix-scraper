import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EpisodesModule } from './episodes/episodes.module';

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true,
            ttl: 3600,
            max: 1000
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['config/.env.local', 'config/.env']
        }),
        EpisodesModule
    ],
    controllers: [],
    providers: []
})
export class AppModule { }
