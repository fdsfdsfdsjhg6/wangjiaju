const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const WORK_DIR = '/home/runner/work/wangjiaju/wangjiaju';
const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const REPO = 'fdsfdsfdsjhg6/wangjiaju';

const FILES_TO_CONVERT = [
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

// GitHub API helpers
function ghApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'compress-wf',
        'Content-Type': 'application/json',
      }
    };
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, resp => {
          resp.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function getFileSHA(repoPath) {
  try {
    const result = await ghApi('GET', `/repos/${REPO}/contents/${repoPath}?ref=main`);
    return result.data.sha;
  } catch { return null; }
}

async function uploadFile(localPath, repoPath, message) {
  const content = fs.readFileSync(localPath);
  const encoded = content.toString('base64');
  const sha = await getFileSHA(repoPath);
  const body = { message, content: encoded, branch: 'main' };
  if (sha) body.sha = sha;
  try {
    await ghApi('PUT', `/repos/${REPO}/contents/${repoPath}`, body);
    console.log(`  ✓ Uploaded: ${repoPath}`);
  } catch(e) {
    console.log(`  ✗ Upload FAILED: ${e.message.substring(0, 200)}`);
    throw e;
  }
}

async function main() {
  process.chdir(WORK_DIR);
  console.log('Work dir:', process.cwd());

  // Load sharp
  const sharp = require('sharp');
  const compressedDir = path.join(WORK_DIR, 'compressed');
  if (!fs.existsSync(compressedDir)) fs.mkdirSync(compressedDir, { recursive: true });

  const results = [];
  let totalOrig = 0, totalWebp = 0;

  // Step 1: Convert images
  console.log('\n=== Converting images to WebP ===\n');
  for (const file of FILES_TO_CONVERT) {
    const localOrig = path.join(WORK_DIR, file.path);
    const localWebp = path.join(compressedDir, path.basename(file.webp));
    
    console.log(`Processing: ${file.path}...`);
    
    try {
      // Download original if not local
      if (!fs.existsSync(localOrig)) {
        const rawUrl = `https://raw.githubusercontent.com/${REPO}/main/${file.path}`;
        console.log(`  Downloading from ${rawUrl}...`);
        await downloadFile(rawUrl, localOrig);
        const stats = fs.statSync(localOrig);
        console.log(`  Downloaded: ${(stats.size/1024/1024).toFixed(2)} MB`);
      } else {
        console.log(`  Using local file: ${(fs.statSync(localOrig).size/1024/1024).toFixed(2)} MB`);
      }
      
      const origSize = fs.statSync(localOrig).size;
      totalOrig += origSize;
      
      // Convert to WebP
      await sharp(localOrig)
        .webp({ quality: 85 })
        .toFile(localWebp);
      
      const webpSize = fs.statSync(localWebp).size;
      totalWebp += webpSize;
      console.log(`  WebP: ${(webpSize/1024/1024).toFixed(2)} MB (saved ${((origSize-webpSize)/1024/1024).toFixed(2)} MB)`);
      
      // Upload WebP via GitHub API
      await uploadFile(localWebp, file.webp, `chore: convert ${file.path} to WebP`);
      
      results.push({ ...file, origSize, webpSize });
    } catch(e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Converted ${results.length} files`);
  console.log(`Total: ${(totalOrig/1024/1024).toFixed(2)} MB → ${(totalWebp/1024/1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOrig-totalWebp)/1024/1024).toFixed(2)} MB`);

  // Step 2: Update index.html URLs
  console.log('\n=== Updating index.html ===\n');
  const indexPath = path.join(WORK_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  let replaced = 0;

  for (const file of results) {
    const oldPath = file.path;
    const newPath = file.webp;
    
    // Replace GitHub Pages URL
    html = html.replace(
      new RegExp(`fdsfdsfdsjhg6\\.github\\.io/wangjiaju/${oldPath.replace(/\./g, '\\.').replace(/\//g, '\\/')}`, 'g'),
      `fdsfdsfdsjhg6.github.io/wangjiaju/${newPath}`
    );
    // Replace relative path
    html = html.replace(
      new RegExp(oldPath.replace(/\./g, '\\.').replace(/\//g, '\\/'), 'g'),
      newPath
    );
    console.log(`  ${path.basename(oldPath)} → ${path.basename(newPath)}`);
    replaced++;
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`\n${replaced} URLs replaced`);
  
  // Upload index.html
  await uploadFile(indexPath, 'index.html', 'chore: update image URLs to WebP');
  console.log('\nAll done!');
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
