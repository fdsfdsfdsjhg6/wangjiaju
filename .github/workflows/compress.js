const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Config
const REPO = 'fdsfdsfdsjhg6/wangjiaju';
const BRANCH = 'main';
const GH_TOKEN = process.env.GH_TOKEN;
const WORK_DIR = '/home/runner/work/wangjiaju/wangjiaju';

// Files to compress: { path: relative path in repo, quality: 85 }
const FILES_TO_COMPRESS = [
  { path: 'assets/ai-visuals/fj2.png', webp: 'assets/ai-visuals/fj2.webp' },
  { path: 'assets/ai-visuals/fj3.png', webp: 'assets/ai-visuals/fj3.webp' },
  { path: 'assets/ai-visuals/fj4.png', webp: 'assets/ai-visuals/fj4.webp' },
  { path: 'assets/ai-visuals/fj5.png', webp: 'assets/ai-visuals/fj5.webp' },
  { path: 'assets/ecommerce/beer-ad1.png', webp: 'assets/ecommerce/beer-ad1.webp' },
  { path: 'assets/3d-models/phone-render.png', webp: 'assets/3d-models/phone-render.webp' },
  { path: 'assets/graphic-design/superman.png', webp: 'assets/graphic-design/superman.webp' },
  { path: 'assets/3d-models/bath-render.png', webp: 'assets/3d-models/bath-render.webp' },
  { path: 'assets/images/img-about.png', webp: 'assets/images/img-about.webp' },
  { path: 'assets/ecommerce/handsoap.png', webp: 'assets/ecommerce/handsoap.webp' },
];

// Files to keep as-is (small enough)
const FILES_TO_KEEP = [
  'assets/images/wf-screenshot172.png',
  'assets/images/ip-process.png',
  'assets/ai-visuals/fj1.png',
  'assets/graphic-design/washing-machine.jpg',
  'assets/graphic-design/ocean-outfit.jpg',
  'assets/graphic-design/crystal-brick.jpg',
  'assets/3d-models/phone-white.jpg',
  'assets/3d-models/bath-white.png',
  'assets/ecommerce/beer-ad2.png',
  'assets/ecommerce/figure-ecom1.jpg',
  'assets/ecommerce/figure-ecom2.jpg',
  'assets/ecommerce/figure-ecom3.jpg',
  'assets/images/clip-photo1.jpg',
  'assets/images/clip-photo2.jpeg',
  'assets/music/bgm.ogg',
];

function ghApi(endpoint, options = {}) {
  const url = `https://api.github.com/repos/${REPO}${endpoint}`;
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'compress-action',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function downloadFile(pathInRepo, destPath) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${pathInRepo}`;
    const req = https.get(url, { headers: { 'Authorization': `Bearer ${GH_TOKEN}` } }, (res) => {
      if (res.statusCode === 200) {
        const ws = fs.createWriteStream(destPath);
        res.pipe(ws);
        ws.on('finish', resolve);
      } else {
        reject(new Error(`Download failed: ${res.statusCode} for ${pathInRepo}`));
      }
    });
    req.on('error', reject);
  });
}

function uploadFile(localPath, repoPath, message) {
  const content = fs.readFileSync(localPath);
  const encoded = content.toString('base64');
  
  // Get existing file SHA if exists
  let sha = null;
  try {
    const existing = ghApi(`/contents/${repoPath}`);
    if (existing && existing.sha) sha = existing.sha;
  } catch (e) {
    // File doesn't exist yet, that's fine
  }

  const body = JSON.stringify({
    message: `chore: upload compressed ${repoPath}`,
    content: encoded,
    ...(sha ? { sha } : {}),
    branch: BRANCH
  });

  return ghApi(`/contents/${repoPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body
  });
}

async function main() {
  console.log('Starting image compression...\n');

  // Ensure directories exist
  const compressedDir = path.join(WORK_DIR, 'compressed');
  if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
  }

  // Step 1: Download and compress images
  const results = [];
  for (const file of FILES_TO_COMPRESS) {
    const localOrig = path.join(WORK_DIR, file.path);
    const localWebp = path.join(compressedDir, path.basename(file.webp));
    const repoWebp = file.webp;

    console.log(`Processing: ${file.path}...`);

    try {
      // Download original
      await downloadFile(file.path, localOrig);
      const origSize = fs.statSync(localOrig).size;
      console.log(`  Downloaded: ${(origSize/1024/1024).toFixed(2)} MB`);

      // Convert to WebP
      const input = await sharp(localOrig)
        .webp({ quality: 85 })
        .toBuffer();
      
      fs.writeFileSync(localWebp, input);
      const webpSize = input.length;
      console.log(`  WebP: ${(webpSize/1024/1024).toFixed(2)} MB (saved ${((origSize-webpSize)/1024/1024).toFixed(2)} MB)`);

      // Upload compressed version
      await uploadFile(localWebp, repoWebp);
      console.log(`  Uploaded to GitHub: ${repoWebp}`);

      results.push({
        original: file.path,
        compressed: repoWebp,
        origSize,
        webpSize,
        saved: origSize - webpSize
      });

      // Cleanup
      fs.unlinkSync(localOrig);
      fs.unlinkSync(localWebp);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  // Summary
  const totalOrig = results.reduce((s, r) => s + r.origSize, 0);
  const totalWebp = results.reduce((s, r) => s + r.webpSize, 0);
  console.log(`\n=== Summary ===`);
  console.log(`Compressed ${results.length} files`);
  console.log(`Total: ${(totalOrig/1024/1024).toFixed(2)} MB → ${(totalWebp/1024/1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOrig-totalWebp)/1024/1024).toFixed(2)} MB`);

  // Step 2: Update index.html URLs
  console.log(`\nUpdating index.html...`);
  const indexPath = path.join(WORK_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  for (const r of results) {
    // Replace .png references with .webp
    const oldPath = r.original;
    const newPath = r.compressed;
    
    // Handle URL patterns: 
    // https://fdsfdsfdsjhg6.github.io/wangjiaju/assets/ai-visuals/fj2.png
    html = html.replace(
      new RegExp(oldPath.replace(/\./g, '\\.').replace(/\//g, '\\/'), 'g'),
      newPath
    );
    
    // Also handle the raw github.io URL pattern
    html = html.replace(
      new RegExp('fdsfdsfdsjhg6\\.github\\.io/wangjiaju/' + oldPath.replace(/\./g, '\\.').replace(/\//g, '\\/'), 'g'),
      'fdsfdsfdsjhg6.github.io/wangjiaju/' + newPath
    );
    
    console.log(`  ${path.basename(oldPath)} → ${path.basename(newPath)}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`\nindex.html updated with ${results.length} URL replacements`);

  // Upload updated index.html
  await uploadFile(indexPath, 'index.html');
  console.log('index.html uploaded to GitHub');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
