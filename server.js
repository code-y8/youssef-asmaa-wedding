const h=require('http'),f=require('fs'),p=require('path');
const types={
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.mp4':'video/mp4','.mp3':'audio/mpeg','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.ics':'text/calendar'
};
function serveFile(r,fp,range){
  let st;
  try{st=f.statSync(fp)}catch(e){r.writeHead(404);r.end('Not found');return}
  let ext=p.extname(fp).toLowerCase(),ct=types[ext]||'application/octet-stream';
  if(range&&ct.startsWith('video/')){
    let parts=range.replace(/bytes=/,'').split('-');
    let start=parseInt(parts[0],10),end=parts[1]?parseInt(parts[1],10):st.size-1;
    if(isNaN(start)){start=0;end=st.size-1}
    r.writeHead(206,{
      'Content-Range':`bytes ${start}-${end}/${st.size}`,
      'Accept-Ranges':'bytes','Content-Length':end-start+1,'Content-Type':ct
    });
    f.createReadStream(fp,{start,end}).pipe(r);
  }else{
    r.writeHead(200,{
      'Content-Type':ct,'Content-Length':st.size,
      'Accept-Ranges':'bytes','Cache-Control':'no-cache'
    });
    f.createReadStream(fp).pipe(r);
  }
}
h.createServer((q,r)=>{
  let s=q.url==='/'?'/index.html':q.url;
  let fp=p.join(process.cwd(),s);
  serveFile(r,fp,q.headers.range);
}).listen(8080,'0.0.0.0',()=>console.log('Server running on http://192.168.1.4:8080'));
