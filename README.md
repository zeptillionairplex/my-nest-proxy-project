![custom Proxy Server Result](https://github.com/zeptillionairplex/my-nest-proxy-project/assets/166411937/7462d108-a9c5-46b2-88f4-40d180da4466)  
이 문제는 최신 버전의 `http-proxy-middleware`에서 `onProxyReq`와 같은 특정 옵션을 사용하는 경우 발생할 수 있습니다. 이 문제를 해결하려면 `onProxyReq` 옵션을 올바르게 사용하도록 코드와 타입 정의를 조정해야 합니다.

여기서는 `Options` 인터페이스를 명시적으로 확장하거나 타입 캐스팅을 사용하여 해결할 수 있습니다.

### 코드 개선

#### 1. ProxyService 수정

**src/proxy/proxy.service.ts**

```typescript
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
```

여기서 중요한 부분은 `as Options & { onProxyReq: (proxyReq: any, req: Request, res: Response) => void }`로 타입을 확장하여 `onProxyReq`를 포함시키는 것입니다.

### 전체 매뉴얼 업데이트

### 파일 구조

```
/MyNestProxyProject
    |-- dist
        |-- start-localtunnel.js
    |-- src
        |-- main.ts
        |-- app.module.ts
        |-- proxy
            |-- proxy.module.ts
            |-- proxy.controller.ts
            |-- proxy.service.ts
    |-- package.json
    |-- tsconfig.json
    |-- start-localtunnel.ts
    |-- Dockerfile
    |-- docker-compose.yml
```

### 1. 준비 작업

#### 1.1 Nest.js 프로젝트 생성

터미널에서 다음 명령어를 실행하여 Nest.js 프로젝트를 생성합니다.

```bash
npm install -g @nestjs/cli
nest new MyNestProxyProject
cd MyNestProxyProject
```

#### 1.2 필요한 패키지 설치

프로젝트 디렉토리에서 다음 명령어를 실행하여 `localtunnel` 및 `http-proxy-middleware`와 그 타입 선언 파일을 설치합니다.

```bash
npm install localtunnel http-proxy-middleware
npm install --save-dev @types/http-proxy-middleware ts-node
```

### 2. Localtunnel 스크립트 작성

프로젝트 루트에 `start-localtunnel.ts` 파일을 생성하고 다음 코드를 작성합니다.

**start-localtunnel.ts**

```typescript
import localtunnel from 'localtunnel';

(async () => {
  const port = 3000; // Nest.js 서버가 실행 중인 포트
  const tunnel = await localtunnel({ port });

  console.log(`LocalTunnel is running at: ${tunnel.url}`);

  // 터널이 닫히는 경우 핸들링
  tunnel.on('close', () => {
    console.log('LocalTunnel is closed');
  });
})();
```

### 3. tsconfig.json 수정

**tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "moduleResolution": "node",
    "typeRoots": ["./node_modules/@types"],
    "rootDir": "./"
  },
  "include": ["src/**/*.ts", "start-localtunnel.ts"]
}

```

### 4. Nest.js 프록시 서버 설정

#### 4.1 프록시 서비스 작성

**src/proxy/proxy.service.ts**

```typescript
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
```

#### 4.2 프록시 컨트롤러 작성

**src/proxy/proxy.controller.ts**

```typescript
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
```

#### 4.3 프록시 모듈 작성

**src/proxy/proxy.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
```

#### 4.4 앱 모듈 업데이트

**src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [ProxyModule],
})
export class AppModule {}
```

### 5. Localtunnel과 서버 통합

**src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import localtunnel from 'localtunnel';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // LocalTunnel 설정 및 URL 출력
  const tunnel = await localtunnel({ port: 3000 });

  Logger.log(`LocalTunnel is running at: ${tunnel.url}`, 'Bootstrap');

  tunnel.on('close', () => {
    Logger.log('LocalTunnel is closed', 'Bootstrap');
  });
}

bootstrap();
```

### 6. Docker 설정

#### 6.1 Dockerfile 작성

프로젝트 루트에 `Dockerfile` 파일을 생성하고 다음 코드를 작성합니다.

**Dockerfile**

```Dockerfile
# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:dev"]
```

#### 6.2 Docker Compose 파일 작성

프로젝트 루트에 `docker-compose.yml` 파일을 생성하고 다음 코드를 작성합니다.

**docker-compose.yml**

```yaml
# docker-compose up --build
# docker-compose down -v
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    command: npm run start:dev
```

### 7. 프로젝트 실행

#### 7.1 Docker Compose를 사용하여 프로젝트 실행

터미널에서 다음 명령어를 실행하여 Docker Compose로 프로젝트를 시작합니다.

```bash
docker-compose up --build
```

서버가 시작되면 터미널에 Localtunnel URL이 출력됩니다. 이 URL을 통해 외부에서 로컬 서버에 접근할 수 있습니다.

### 요약

- **필요한 패키지 설치**: `localtunnel`과 `http-proxy-middleware` 및 그 타입 선언 파일을 설치합니다.
- **Localtunnel 스크립트 작성**: `require`를 `import`로 대체하고, 파일 확장자를 `.ts`로 변경하여 `start-localtunnel.ts` 파일을 작성합니다.
- **tsconfig.json 수정**: `esModuleInterop` 옵션을 `true`로 설정합니다.
- **Nest.js 프록시 서버 설정**: 프록시 서비스를 작성하고, Nest.js 서버와 통합합니다.
- **Docker 설정**: Dockerfile과 Docker Compose 파일을 작성하여 프로젝트를 컨테이너화합니다.
- **프로젝트 실행**: Docker Compose를 사용하여 프로젝트를 실행하면 Localtunnel URL이 터미널에 자동으로 출력됩니다.

이 매뉴얼을 따라하면, Nest.js 서버를 Docker로 컨테이너화하고,

 외부에서 접근 가능하게 하며, 프로그램적으로 Localtunnel URL을 터미널에 출력하는 프록시 서버를 설정할 수 있습니다.
