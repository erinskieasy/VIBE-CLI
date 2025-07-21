
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/preview.html') {
        try {
            const html = fs.readFileSync(path.join(__dirname, 'preview.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading preview page');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎨 Component preview server running at http://0.0.0.0:${PORT}`);
    console.log('Open your browser to see the interactive component preview!');
});
