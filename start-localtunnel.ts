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
