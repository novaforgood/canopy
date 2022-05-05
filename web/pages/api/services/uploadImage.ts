import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { requireServerEnv } from "../../../server/env";

export const config = {
  api: {
    bodyParser: true, // Disallow body parsing, consume as stream
  },
};

aws.config.update({
  secretAccessKey: requireServerEnv("AWS_SECRET_ACCESS_KEY"),
  accessKeyId: requireServerEnv("AWS_ACCESS_KEY_ID"),
  region: requireServerEnv("AWS_REGION"),
});

const s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: requireServerEnv("AWS_S3_BUCKET"),
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: false,
})
  .use(upload.single("upload"))
  .post<{ file: Express.Multer.File }>(async (req, res) => {
    console.log(req.body);
    const response = makeApiSuccess({ detail: "Success", file: req.file });
    res.status(response.code).json(response);
  });
