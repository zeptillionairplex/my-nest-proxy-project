import { Controller, All, Req, Res, Next } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response, NextFunction } from 'express';

@Controller('proxy')
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) {}

    @All('*')
    handleRequest(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
        const target = 'http://localhost:3000'; // 여기서 로컬 서버의 주소를 지정합니다.
        const proxy = this.proxyService.getProxyMiddleware(target);
        proxy(req, res, next);
    }
}