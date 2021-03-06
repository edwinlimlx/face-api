const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const args = require('yargs').argv;

exports.mkdir = (p) => {
  if (!fs.existsSync(p)) {
    mkdirp(p, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  }
};

exports.names = [
  'Hanis Adibah Yusof',
  'Jovan Li',
  'Jose Mella',
  'Deepthi Sarma Konduru',
  'Celia Cui',
  'Sagar Ghoting',
  'Kaylie Ong Hui Ting',
  'Tushaara Vadakkel Paul',
  'Kunal',
  'Zoe Elizabeth Chaplin',
  'Noraziah Bansir',
  'Mike Tyldesley',
  'Ivy',
  'Atlas Lim',
  'Ivy Seah',
  'Ramkumar Annamalai',
  'Daphne Chan',
  'Jason Gurfink',
  'Darren Tan',
  'Peng Lin',
  'Jansen Low',
  'Melissa Ashman',
  'Diksha Lamba',
  'Moses Ong',
  'Jolene Loke',
  'Michael Mitchell',
  'Heera Tamang',
  'Sunjay',
  'Tyler W Munoz',
  'Jin Wei',
  'Vincent Wong',
  'Amos Tan Pang Yih',
  'Saachi Aurora',
  'Yong Yong Ng',
  'Kit Goh',
  'Ralf Juergen Zink',
  'Lim Jingshen',
  'Wrenna Wong',
  'Jonathan Sharp',
  'Liak Wee',
  'Jaimie Toi',
  'Sheetal George',
  'Andy Male',
  'Mona Walia',
  'Perlyn Tan Pei Yun',
  'Edwin Lim',
  'Cindy Lim',
  'Shadia Galal',
  'Adarsh Mysore Chandrashekar',
  'Sherilyn Lee',
  'Annabel Su',
  'Ida Ong',
  'Kevin',
  'Clara Wen',
  'Yiwen Li',
  'Judith Lee',
  'Cynthia Tan',
  'Kim Douglas',
  'Ivan Tan',
  'Grace Cheow',
  'Esther Ang',
  'Massha Mohamad',
  'Sneha Kohli',
  'Raymond Soh',
  'Jayashree Srinivasan',
  'Srinivasan Jagannathan',
];

exports.saveFile = (fileName, buff) => {
  const baseDir = args.output || './output';
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buff);
};
