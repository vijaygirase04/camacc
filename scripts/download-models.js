const fs = require('fs');
const path = require('path');
const https = require('https');

const models = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const outputDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadFile(file) {
  const filePath = path.join(outputDir, file);
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    https.get(baseUrl + file, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${file}: ${response.statusCode}`));
        return;
      }
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${file}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

(async () => {
  for (const file of models) {
    try {
      await downloadFile(file);
    } catch (err) {
      console.error(err.message);
    }
  }
})();
