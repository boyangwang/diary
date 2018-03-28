let app, db;

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
      },
    };
  },
};
