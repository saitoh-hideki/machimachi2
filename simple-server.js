const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>まちまちチャット商店街</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .container {
          padding: 2rem;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .emoji {
          font-size: 2rem;
          margin: 0 0.5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏪 まちまちチャット商店街 🏪</h1>
        <p>デジタル商店街プラットフォーム</p>
        <p>
          <span class="emoji">🥐</span>
          <span class="emoji">🌸</span>
          <span class="emoji">📚</span>
          <span class="emoji">☕</span>
        </p>
        <p>サーバーが正常に動作しています！</p>
        <p><strong>次のステップ：</strong> Next.jsアプリケーションの実装</p>
      </div>
    </body>
    </html>
  `);
});

const port = 3000;
server.listen(port, () => {
  console.log(`サーバーが起動しました: http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('サーバーエラー:', err);
});