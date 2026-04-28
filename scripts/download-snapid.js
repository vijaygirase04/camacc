
const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../snapid_screens');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const screens = [
    { name: 'event_login.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2YxYzkxNTEzMjk0MDQzYTA5NmI0ODQ5M2ZlNWMxZWQ2EgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'face_scan_verification.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzJjNmI3MzcwNGJhYTQ2NGVhZWExMmVjODZlODA3OWQ3EgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'photo_gallery.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNlMDM0ZTU0Yjg4NjQzMTE4Mzg4ZWFmOGVlZjE3ZTgzEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'cart_checkout.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ1OWU2Yzk0ZTA4ZTQ2MjI5NzljNGI4ZjU4ZGE1Mzg5EgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'photo_preview_modal.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UzM2UyOGFkMWI1MzQ3ZDRhOWJjNjdhY2UxMzljMDI3EgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'payment_success.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2VkZTlhZTBlMTI1NzQ2NjQ5NGJlYWYwOTFiYzk2MGNlEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'admin_dashboard.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFmZWYxNzA3Yzk2MDQzOGM5NGNkYzJkODk4YTNkMGRhEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'media_upload.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk2MWViYWY3YmFmZDQ0NjViM2M5YmEwNGFjNjc5OGExEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'event_management.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNjMTI5NGJiZjg4NDQ1YmE4ZWE5YmNhNzA5MjExMTI4EgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'orders_revenue.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk0ZGUyMDg4YzJkNzQ0OTk4NDY0NjY5MzY1MWUwZjBhEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' },
    { name: 'event_settings.html', url: 'https://contribution.usercontent.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MzNzU4Yzg1ODY2YjRmZjJiYzZlOTRjYTgyZTFjOTNkEgsSBxCdtYG8gQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTUxMjA3NDM0NTgyODE4MDA1Mw&filename=&opi=89354086' }
];

async function download(screen) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(outputDir, screen.name));
        https.get(screen.url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
              https.get(response.headers.location, (redirectResponse) => {
                redirectResponse.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded ${screen.name}`);
                    resolve();
                });
              });
            } else {
              response.pipe(file);
              file.on('finish', () => {
                  file.close();
                  console.log(`Downloaded ${screen.name}`);
                  resolve();
              });
            }
        }).on('error', (err) => {
            fs.unlink(path.join(outputDir, screen.name), () => {});
            reject(err);
        });
    });
}

(async () => {
    for (const screen of screens) {
        try {
            await download(screen);
        } catch (err) {
            console.error(`Failed to download ${screen.name}:`, err.message);
        }
    }
})();
