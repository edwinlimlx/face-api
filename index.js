import 'babel-polyfill';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import * as _ from 'lodash';
import * as faceapi from 'face-api.js';
import * as commons from './commons';

global.fetch = require('node-fetch');

// console.log('faceapi', faceapi);

const options = {
  concurrent: 8,
  inputPath: './faces_labelled/',
  ouput: './model.json',
};

init = async () => {
  // await faceapi.loadSsdMobilenetv1Model('/models');
  // console.log(faceapi.nets);

  const imagesByPath = (await fetch('dir.txt').then(res => res.text()))
    .split('\n')
    .map(path => path.replace('./dist/', './'));

  const filepaths = await Promise.all(
    commons.names.map(
      async name => await Promise.all(
        imagesByPath
          .filter(path => path.includes(name))
          .map(path => faceapi.fetchImage(path).then(res => res)),
      ),
    ),
  );

  const imagesByNames = {};
  commons.names.forEach((name, nameIndex) => (imagesByNames[name] = filepaths[nameIndex]));
  console.log('imagesByNames', imagesByNames);

  
  const descriptorByNames = await _.mapValues(imagesByNames, async images => await Promise.all(images.map(image => faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor())));
  // console.log('descriptorByNames1', imagesByNames['Adarsh Mysore Chandrashekar'][0]);
  // console.log('descriptorByNames1', await faceapi.detectSingleFace(imagesByNames['Adarsh Mysore Chandrashekar'][0]).withFaceLandmarks().withFaceDescriptor());
  console.log('descriptorByNames2', descriptorByNames);
};

init();
