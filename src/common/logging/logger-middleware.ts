import { Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export class LoggerMiddleware implements NestMiddleware {

    private readonly logger = new Logger(LoggerMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        req['requestId'] = randomUUID();
        const requestData = {
            requestId: req['requestId'],
            method: req.method,
            url: req.url,
            // body: req.body, // uncomment for debugging
            headers: req.headers
        };
        this.logger.debug('Request: ' + JSON.stringify(requestData));

        res.on('close', () => {
            const responseData = {
                requestId: res.req['requestId'],
                method: res.req.method,
                url: res.req.url,
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                // body: res.json, // uncomment for debugging
                headers: res.getHeaders()
            };
            this.logger.debug('Response: ' + JSON.stringify(responseData));
        });

        next();
    }
    
}
