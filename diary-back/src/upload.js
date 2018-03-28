const aws = require('aws-sdk');
const multer = require('koa-multer');
const multerS3 = require('multer-s3');

let app, db;

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});
const upload = multer({
  // storage: multerS3({
  //   s3: s3,
  //   bucket: 'diary',
  //   acl: 'public-read',
  //   key: function (request, file, cb) {
  //     console.mylog('uploadImage', file);
  //     cb(null, file.name);
  //   }
  // }),
  // storage: multer.memoryStorage
  dest: 'uploads/',
}).single('image');

module.exports = {
  init: (passedApp, passedDb) => {
    app = passedApp;
    db = passedDb;
  },
  uploadImage: async (ctx, next) => {
    ctx.response.body = {
      data: {
        link:
          'https://img.alicdn.com/tfs/TB1N4A.mfDH8KJjy1XcXXcpdXXa-1392-414.png',
        filename,
      },
    };
  },
};
