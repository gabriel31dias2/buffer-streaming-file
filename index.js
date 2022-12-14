const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors())

 app.get('/', (req, res) => {
   fs.readFile('./index.html', (err, html) => res.end(html));
 });

 app.get('/audio/:path/:audioName', (req, res) => {
   const { audioName } = req.params;
   let { path } = req.params;

   console.log(path)

   path = path.replace(/-/g, '/');

   const audioFile = `./audios/${path}/${audioName}.wav`; 

   fs.stat(audioFile, (err, stats) => {

     if (err) {
       console.log(err);
       return res.status(404).end('<h1>Audio Not found</h1>');
     }

     const { range } = req.headers;
     const { size } = stats;
     const start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
     const end = size - 1;
     const chunkSize = (end - start) + 1;
     // Definindo headers de chunk
     res.set({
       'Content-Range': `bytes ${start}-${end}/${size}`,
       'Accept-Ranges': 'bytes',
       'Content-Length': chunkSize,
       'Content-Type': 'Audio/wav'
     });
     // É importante usar status 206 - Partial Content para o streaming funcionar
     res.status(206);
     // Utilizando ReadStream do Node.js
     // Ele vai ler um arquivo e enviá-lo em partes via stream.pipe()
     const stream = fs.createReadStream(audioFile, { start, end });
     stream.on('open', () => stream.pipe(res));
     stream.on('error', (streamErr) => res.end(streamErr));
   });
 });
 app.listen(7000, () => console.log('Server started reading wav files!'));