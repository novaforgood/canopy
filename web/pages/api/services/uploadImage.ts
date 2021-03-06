import aws from "aws-sdk";
import mime from "mime-types";
import multer from "multer";
import multerS3 from "multer-s3";
import { Middleware } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next/types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import { executeInsertImageMutation } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

export interface FileResponse {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  contentDisposition: null;
  contentEncoding: null;
  storageClass: string;
  serverSideEncryption: null;
  metadata: {
    fieldName: string;
  };
  location: string;
  etag: string;
  versionId: string;
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

aws.config.update({
  secretAccessKey: requireServerEnv("AWS_ENV_SECRET_ACCESS_KEY"),
  accessKeyId: requireServerEnv("AWS_ENV_ACCESS_KEY_ID"),
  region: requireServerEnv("AWS_ENV_REGION"),
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: requireServerEnv("AWS_ENV_S3_BUCKET"),
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    key: function (req, file, cb) {
      const fileExt = mime.extension(file.mimetype) ?? "";
      const uuid = uuidv4();
      cb(null, `${uuid}.${fileExt}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: true,
})
  .use(upload.single("upload"))
  .post<{ file: FileResponse }>(async (req, res) => {
    const { data, error } = await executeInsertImageMutation({
      data: {
        url: req.file.location,
        id: req.file.key.split(".")[0],
        uploader_user_id: req.token.uid,
      },
    });
    if (error) {
      throw makeApiError(error.message);
    }
    if (!data?.insert_image_one) {
      throw makeApiError("No data returned");
    }

    const response = makeApiSuccess({
      detail: "Success",
      file: req.file,
      image: data.insert_image_one,
    });
    res.status(response.code).json(response);
  });
