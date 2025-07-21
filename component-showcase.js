const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to read all component files
function readComponentFiles() {
  const componentsDir = path.join(__dirname, 'test_server/src/components');
  const components = [];
  
  try {
    const files = fs.readdirSync(componentsDir);
    
    files.forEach(file => {
      if (file.endsWith('.tsx')) {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract metadata from comments
        const sourceMatch = content.match(/\/\/ vibe-source: (.+)/);
        const componentMatch = content.match(/\/\/ component: (.+)/);
        const categoryMatch = content.match(/\/\/ category: (.+)/);
        
        // Extract component name from export
        const exportMatch = content.match(/export default function (\w+)/);
        
        components.push({
          filename: file,
          componentName: componentMatch ? componentMatch[1] : (exportMatch ? exportMatch[1] : file.replace('.tsx', '')),
          source: sourceMatch ? sourceMatch[1] : 'Unknown',
          category: categoryMatch ? categoryMatch[1] : 'uncategorized',
          code: content,
          path: filePath
        });
      }
    });
  } catch (error) {
    console.error('Error reading components:', error);
  }
  
  return components;
}

// Function to generate HTML page
function generateHTML(components) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Hub - Real Components Showcase</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .component-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .code-block {
            background: #1f2937;
            color: #f9fafb;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            line-height: 1.5;
            max-height: 400px;
            overflow-y: auto;
        }
        .component-meta {
            background: #f3f4f6;
            color: #374151;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
        }
        .category-badge {
            display: inline-block;
          background: #ddd6fe;
          color: #5b21b6;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto py-8 px-4">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Component Hub Showcase</h1>
            <p class="text-lg text-gray-600 mb-6">Real components from test_server/src/components/</p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p class="text-blue-800 text-sm">
                    📁 <strong>${components.length} components</strong> found in the components directory
                </p>
            </div>
        </div>

        <!-- Components Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            ${components.map(component => `
                <div class="component-card p-6">
                    <!-- Component Header -->
                    <div class="mb-4 border-b border-gray-200 pb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-xl font-bold text-gray-900">${component.componentName}</h2>
                            <span class="category-badge">${component.category}</span>
                        </div>
                        <p class="text-sm text-gray-600">📁 ${component.filename}</p>
                    </div>

                    <!-- Component Metadata -->
                    <div class="component-meta p-3 rounded-lg mb-4">
                        <div class="text-green-600 mb-1">// vibe-source: ${component.source}</div>
                        <div class="text-blue-600">// component: ${component.componentName}</div>
                        <div class="text-purple-600">// category: ${component.category}</div>
                    </div>

                    <!-- Component Code -->
                    <div class="code-block p-4 rounded-lg">
                        <pre><code>${escapeHtml(component.code)}</code></pre>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- File Structure -->
        <div class="mt-12 bg-white rounded-lg p-6 shadow">
            <h2 class="text-2xl font-bold mb-4">File Structure</h2>
            <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
test_server/<br/>
└── src/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;└── components/<br/>
${components.map(comp => `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── ${comp.filename}<br/>`).join('')}
            </div>
        </div>

        <!-- Statistics -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg p-6 shadow text-center">
                <div class="text-3xl font-bold text-blue-600">${components.length}</div>
                <div class="text-gray-600">Total Components</div>
            </div>
            <div class="bg-white rounded-lg p-6 shadow text-center">
                <div class="text-3xl font-bold text-green-600">${new Set(components.map(c => c.category)).size}</div>
                <div class="text-gray-600">Categories</div>
            </div>
            <div class="bg-white rounded-lg p-6 shadow text-center">
                <div class="text-3xl font-bold text-purple-600">${components.reduce((total, comp) => total + comp.code.split('\\n').length, 0)}</div>
                <div class="text-gray-600">Lines of Code</div>
            </div>
        </div>
    </div>

    <script>
        // Add copy functionality to code blocks
        document.querySelectorAll('.code-block').forEach(block => {
            block.style.cursor = 'pointer';
            block.title = 'Click to copy code';
            
            block.addEventListener('click', () => {
                const code = block.querySelector('code').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const originalBg = block.style.backgroundColor;
                    block.style.backgroundColor = '#065f46';
                    setTimeout(() => {
                        block.style.backgroundColor = originalBg;
                    }, 200);
                });
            });
        });
    </script>
</body>
</html>`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/index.html') {
    const components = readComponentFiles();
    const html = generateHTML(components);
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/api/components') {
    const components = readComponentFiles();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(components, null, 2));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Real Component Showcase running at http://localhost:${PORT}`);
  console.log(`📦 Displaying ${readComponentFiles().length} components from test_server/src/components/`);
  console.log('💡 Click any code block to copy the component code');
});