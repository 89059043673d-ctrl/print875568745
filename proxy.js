const http = require('http');
const net = require('net');
const PRINTER_IP = '192.168.1.105';
const PRINTER_PORT = 9100;
const PROXY_PORT = 3100;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  let body = [];
  let responded = false;

  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    const data = Buffer.concat(body);
    const socket = new net.Socket();

    socket.connect(PRINTER_PORT, PRINTER_IP, () => {
      socket.write(data);
      socket.end();
    });

    socket.on('close', () => {
      if (!responded) {
        responded = true;
        res.writeHead(200);
        res.end('OK');
      }
    });

    socket.on('error', (err) => {
      console.error('Printer error:', err.message);
      if (!responded) {
        responded = true;
        res.writeHead(500);
        res.end('Printer error: ' + err.message);
      }
    });
  });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log('Print proxy running on port ' + PROXY_PORT);
});
