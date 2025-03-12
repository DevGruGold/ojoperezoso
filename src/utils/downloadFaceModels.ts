
import * as faceapi from 'face-api.js';

// This function downloads the face-api.js models if they don't exist
export const downloadFaceModels = async () => {
  try {
    // Create a models directory in the public folder if it doesn't exist
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    console.log('Face API models downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error downloading face API models:', error);
    return false;
  }
};
