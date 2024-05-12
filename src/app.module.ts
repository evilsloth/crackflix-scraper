import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { HttpLoggerService } from './common/logging/http-logger.service';
import { LoggerMiddleware } from './common/logging/logger-middleware';
import { EpisodesModule } from './episodes/episodes.module';
import { FilesModule } from './files/files.module';
import { MoviesModule } from './movies/movies.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth-middleware';

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true,
            ttl: 3600000,
            max: 1000
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['config/.env.local', 'config/.env']
        }),
        CommonModule,
        AuthModule,
        EpisodesModule,
        MoviesModule,
        FilesModule
    ],
    controllers: [],
    providers: []
})
export class AppModule implements OnModuleInit {

    constructor(private httpLoggerService: HttpLoggerService) {
    }

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware, AuthMiddleware)
            .forRoutes('*');
    }

    onModuleInit() {
        this.httpLoggerService.init();
    }

}
