const http=require('http');
const fs=require('fs');
const path=require('path');
http.createServer((req,res)=>{
  let p=req.url==='/'?'/PlayablePrototype/index.html':req.url;
  let fp=path.join('C:/Users/LOQ/Desktop/bhooo',decodeURIComponent(p.split('?')[0]));
  if(!fs.existsSync(fp)){res.writeHead(404);res.end('nf');return;}
  let ct='text/html';
  if(fp.endsWith('.js'))ct='text/javascript';
  if(fp.endsWith('.css'))ct='text/css';
  if(fp.endsWith('.json'))ct='application/json';
  res.writeHead(200,{'Content-Type':ct});
  res.end(fs.readFileSync(fp));
}).listen(8080,()=>{console.log('8080');});
