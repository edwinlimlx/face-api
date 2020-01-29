const path = require('path');
const _ = require('lodash');
const args = require('yargs').argv;
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');
const commons = require('./commons');
const configs = require('./configs');

const options = {
  concurrent: args.concurrent ? args.concurrent : 8,
  input: args.input ? args.input : './faces_labelled',
  output: args.output ? args.output : './output',
};

const init = async () => {
  await configs.faceDetectionNet.loadFromDisk('./src/models/');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./src/models/');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./src/models/');

  const imagesByPath = fs
    .readdirSync(options.input)
    .filter(p => !p.includes('DS_Store'))
    .map(p => path.join(options.input, p));

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
        .detectSingleFace(image, configs.faceDetectionOptions)
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
  const labelledDescriptors = _.map(descriptorByNames, (descriptors, name) => new faceapi.LabeledFaceDescriptors(name, descriptors));
  commons.saveFile('labelledDescriptors.json', JSON.stringify(labelledDescriptors));

  // const faceMatcher = new faceapi.FaceMatcher(labelledDescriptors);
  // console.log('faceMatcher0', faceMatcher.findBestMatch(descriptorByNames['Hanis Adibah Yusof'][0]).toString());
  // console.log('faceMatcher2', faceMatcher.findBestMatch(descriptorByNames['Jose Mella'][0]).toString());
};

init();
