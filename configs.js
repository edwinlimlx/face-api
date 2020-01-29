const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');

console.log("error");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
exports.faceDetectionNet = faceDetectionNet;

// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 408;
const scoreThreshold = 0.5;

// MtcnnOptions
const minFaceSize = 50;
const scaleFactor = 0.8;

tf.disableDeprecationWarnings();

const getFaceDetectorOptions = net => (net === faceapi.nets.ssdMobilenetv1
  ? new faceapi.SsdMobilenetv1Options({ minConfidence })
  : net === faceapi.nets.tinyFaceDetector
    ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor }));

exports.faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet);
