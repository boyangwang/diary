const aws = require('aws-sdk');
const multer = require('koa-multer');
const multerS3 = require('multer-s3');
const config = require('./config.js');

let app, db;

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  credentials: new aws.Credentials(config.aws.key, config.aws.secret),
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'diary',
    acl: 'public-read',
    key: function(request, file, cb) {
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
}).array('image', 1);

module.exports = {
  init: (passedApp, passedDb) => {
    app = passedApp;
    db = passedDb;
  },
  uploadImage: async (ctx, next) => {
    await upload(ctx, next);
    const file = ctx.req.files[0];
    ctx.response.body = {
      data: { link: file.location },
    };
  },
};
