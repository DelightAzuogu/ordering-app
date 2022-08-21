const { Readable } = require("stream");
require("dotenv").config();
const { google } = require("googleapis");

exports.putAddMenuItem = async (req, res, next) => {
  const stream = Readable.from(req.file.buffer);

  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT__SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });
  try {
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimeType,
      },
      media: {
        mimeType: req.file.mimeType,
        body: stream,
      },
    });
    console.log(response.data.id);

    await drive.permissions.create({
      fileId: "1Z97EmlkgAEtRuoA6hjyj3e16CKFLCeIU",
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: "1Z97EmlkgAEtRuoA6hjyj3e16CKFLCeIU",
      fields: "webContentLink, webViewLink",
    });

    console.log(result.data);
  } catch (err) {
    console.log(err);
  }
};
