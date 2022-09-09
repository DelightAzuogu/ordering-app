const { google } = require("googleapis");
const { uuid } = require("uuidv4");

const googleDrive = () => {
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

  return drive;
};

exports.googleDriveUpload = async (req, stream) => {
  const drive = googleDrive();
  try {
    const response = await drive.files.create({
      requestBody: {
        name: uuid() + "-" + req.file.originalname,
        mimeType: req.file.mimeType,
      },
      media: {
        mimeType: req.file.mimeType,
        body: stream,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

exports.googleDriveDelete = async (fileId) => {
  const drive = googleDrive();
  try {
    const response = await drive.files.delete({
      fileId,
    });
    return response;
  } catch (err) {
    return err;
  }
};

exports.googleDriveGetLink = async (fileId) => {
  const drive = googleDrive();
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId,
      fields: "webContentLink, webViewLink",
    });

    return result;
  } catch (err) {
    return err;
  }
};
