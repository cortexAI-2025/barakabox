const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const uploadImage = async (filePath, folder = 'barakabox') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  });
  return result.secure_url;
};

const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage, cloudinary };
