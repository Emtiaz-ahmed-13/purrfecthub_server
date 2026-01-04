import fs from "fs";
import ImageKit from "imagekit";
import multer from "multer";
import path from "path";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

// Configure Multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

const uploadToImageKit = async (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, (err, data) => {
      if (err) {
        return reject(err);
      }

      imagekit.upload({
        file: data, // required
        fileName: file.originalname, // required
        folder: "/perfecthub", // optional
      }, (error, result) => {
        // Remove file from local storage after upload
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting local file:", unlinkErr);
        });

        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  });
};

// Helper for direct file path upload (useful for scripts/testing)
const uploadFile = async (filePath: string, fileName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err);

      imagekit.upload({
        file: data,
        fileName: fileName,
        folder: "/perfecthub/test",
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  });
};

export const FileUploadHelper = {
  uploadToImageKit,
  uploadFile,
  upload
};
