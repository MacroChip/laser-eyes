const sharp = require('sharp')
const vision = require('@google-cloud/vision');

async function core(faceFilename, laserEyeFilename, outputFilename) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.faceDetection(faceFilename);
    const faces = result.faceAnnotations;
    // console.log(JSON.stringify(faces, null, 2))
    const leftEyePosition = faces[0].landmarks.find(l => l.type === "LEFT_EYE").position;
    const rightEyePosition = faces[0].landmarks.find(l => l.type === "RIGHT_EYE").position;
    console.log({ leftEyePosition });
    console.log({ rightEyePosition });
    const face = sharp(faceFilename);
    const faceMetadata = await face.metadata();
    const imageSize = Math.min(faceMetadata.width, faceMetadata.height, 250);
    const halfImageSize = imageSize / 2
    const laserEye = await sharp(laserEyeFilename)
        .resize(imageSize, imageSize)
        .toBuffer();
    const oneEye = await face
        .composite([{
            left: parseInt(leftEyePosition.x) - halfImageSize, //TODO: round instead of truncate
            top: parseInt(leftEyePosition.y) - halfImageSize,
            input: laserEye
        }])
        .toBuffer();
    return sharp(oneEye).composite([{
        left: parseInt(rightEyePosition.x) - halfImageSize,
        top: parseInt(rightEyePosition.y) - halfImageSize,
        input: laserEye
    }])
    .toFile(outputFilename);
}

module.exports = {
    core
}
