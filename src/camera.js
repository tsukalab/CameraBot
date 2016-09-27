import 'date-utils';
import childProcess from 'child_process';
import Upload from 's3-uploader';

module.exports = (robot => {
  robot.hear(/camera/, msg => {
    msg.send("OK. I'll take cool pic.");

    const dt = new Date();
    const filename = dt.toFormat('YYYYMMDDHH24MISS') + '.jpg';
    const filepath = process.env.NODE_IMG_PATH + filename;
    const client = new Upload(process.env.NODE_S3_BUCKET, {
      aws: {
        path: process.env.NODEE_S3_PATH,
        region: process.env.NODE_S3_REGION
      },

      cleanup: {
        versions: true,
        original: true
      },

      versions: [{
        maxWidth: 780,
        quality: 100,
        awsImageExpires: 31536000,
        awsImageMaxAge: 31536000
      }]
    });

    childProcess.exec(`raspistill -o -t 1 ${filename}`).then(() => {
      client.upload(filepath, {}, (error, versions, meta) => {
        versions.forEach(image => {
          msg.send(image.url);
        });
      });
    });
  });
});
