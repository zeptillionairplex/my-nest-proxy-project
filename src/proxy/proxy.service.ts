import { Injectable } from '@nestjs/common';
import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
    getProxyMiddleware(target: string): RequestHandler {
    const options: Options = {
        target,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
        onProxyReq: (proxyReq: any, req: Request, res: Response) => {
            console.log(`Proxying request to: ${target}${req.url}`);
        },
    } as Options & { onProxyReq: (proxyReq: any, req: Request, res: Response) => void };

        return createProxyMiddleware(options);
    }
}
