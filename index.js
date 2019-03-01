// import 'babel-polyfill';
// import 'isomorphic-fetch';

// global.fetch = require('node-fetch');
const path = require('path');
// import fs from 'fs';
// import moment from 'moment';
const tf = require('@tensorflow/tfjs-node');
const _ = require('lodash');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');
const commons = require('./commons');

const facesLabelledPath = './dist/faces_labelled';
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
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

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet);

const saveFile = (fileName, buff) => {
  const baseDir = './output';
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buff);
};

const init = async () => {
  await faceDetectionNet.loadFromDisk('./src/models/');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./src/models/');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./src/models/');

  const imagesByPath = fs
    .readdirSync(facesLabelledPath)
    .filter(p => !p.includes('DS_Store'))
    .map(p => path.join(facesLabelledPath, p));

  const imagesArr = await Promise.all(
    commons.names.map(async (name) => {
      const filter = imagesByPath.filter(p => p.includes(name)).map(async p => canvas.loadImage(p));
      return Promise.all(filter);
    }),
  );

  const imagesByNames = {};
  commons.names.forEach((name, nameIndex) => {
    imagesByNames[name] = imagesArr[nameIndex];
  });

  const descriptorFaceArr = await Promise.all(
    imagesArr.map(async (images) => {
      const map = images.map(async image => faceapi
        .detectSingleFace(image, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor());
      return Promise.all(map);
    }),
  );
  const descriptorArr = descriptorFaceArr.map(descriptorResults => _.reduce(
    descriptorResults,
    (arr, descriptorResult) => {
      if (descriptorResult !== undefined) {
        try {
          arr.push(descriptorResult.descriptor);
        } catch (e) {
          console.log(e);
        }
      }
      return arr;
    },
    [],
  ));

  const descriptorByNames = {};
  commons.names.forEach((name, nameIndex) => {
    if (descriptorArr[nameIndex].length) {
      descriptorByNames[name] = descriptorArr[nameIndex];
    }
  });

  console.log(`Building FaceMatcher from ${Object.keys(descriptorByNames).length} results`);
  const labeledDescriptors = _.map(descriptorByNames, (descriptors, name) => new faceapi.LabeledFaceDescriptors(name, descriptors));
  saveFile('labeledDescriptors.json', JSON.stringify(labeledDescriptors));

  // const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
  // console.log('faceMatcher0', faceMatcher.findBestMatch(descriptorByNames['Hanis Adibah Yusof'][0]).toString());
  // console.log('faceMatcher2', faceMatcher.findBestMatch(descriptorByNames['Jose Mella'][0]).toString());
};

init();
