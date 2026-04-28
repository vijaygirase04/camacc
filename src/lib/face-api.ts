import * as faceapi from 'face-api.js';

export const loadModels = async () => {
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
};

export const getFaceEmbedding = async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
  const detection = await faceapi
    .detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection ? detection.descriptor : null;
};

export const getMultiFaceEmbeddings = async (imageElement: HTMLImageElement | HTMLCanvasElement) => {
  const detections = await faceapi
    .detectAllFaces(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map((d) => d.descriptor);
};
