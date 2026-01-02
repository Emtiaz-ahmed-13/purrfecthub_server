import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { FileUploadHelper } from '../src/helpers/fileUploadHelper';

const testImageKit = async () => {
  console.log('Testing ImageKit Service...');
  console.log(`Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);

  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('❌ ImageKit credentials missing in .env');
    return;
  }

  const testFilePath = path.join(__dirname, 'test-image.txt');
  // Create a dummy file for testing
  require('fs').writeFileSync(testFilePath, 'This is a test file for ImageKit upload.');

  try {
    console.log('Uploading test file...');
    const result = await FileUploadHelper.uploadFile(testFilePath, 'test-upload.txt');
    console.log('✅ Upload successful!');
    console.log('File URL:', result.url);
    console.log('File ID:', result.fileId);

    // Clean up
    require('fs').unlinkSync(testFilePath);

  } catch (error) {
    console.error('❌ Upload failed:', error);
    // Clean up
     if (require('fs').existsSync(testFilePath)) {
        require('fs').unlinkSync(testFilePath);
     }
  }
};

testImageKit();
