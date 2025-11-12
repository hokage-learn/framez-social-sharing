import axios from 'axios';

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

/**
 * Upload an image to Cloudinary
 * @param imageUri - Local URI of the image to upload
 * @returns Promise with upload result containing URL and metadata
 */
export const uploadImage = async (
  imageUri: string,
): Promise<UploadResult> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary configuration missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
    );
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'framez-posts'); // Optional: organize uploads in a folder

    const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: () => formData, // Override axios default transform
    });

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        'Failed to upload image',
    );
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param imageUris - Array of local URIs to upload
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  imageUris: string[],
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = imageUris.map((uri) => uploadImage(uri));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload images');
  }
};

