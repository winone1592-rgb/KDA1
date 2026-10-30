// Compatibility entry point for users of the previous version.
import { createServer } from 'vite';
try {
 const server = await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}});
 await server.listen();
 server.printUrls();
} catch(error) {
 console.error('서버를 시작하지 못했습니다. npm install 실행 여부와 5173 포트 사용 여부를 확인해 주세요.');
 console.error(error.message);
 process.exitCode=1;
}
