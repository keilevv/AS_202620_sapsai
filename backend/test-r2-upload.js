// Test script to verify R2 upload with small file
import { R2Service } from './src/services/r2Service.js';
import fs from 'fs';
import path from 'path';

console.log('Testing R2 upload with small file...');

// Create a temporary test file
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const testFilePath = path.join(tempDir, 'test-image.jpg');
// Create a small test image file (1KB)
const testData = Buffer.alloc(1024, 'A');
fs.writeFileSync(testFilePath, testData);

console.log('Test file size:', fs.statSync(testFilePath).size, 'bytes');

// Test upload
const result = await R2Service.uploadFile(testFilePath, 'test-small-file.jpg', 'image/jpeg');
console.log('Upload result:', result);

// Clean up
fs.unlinkSync(testFilePath);
fs.rmdirSync(tempDir);

console.log('R2 upload test completed!');

