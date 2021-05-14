const sharp = require('sharp')
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

async function core(fileName, laserEyeFilename, outputFilename) {
    const [result] = await client.faceDetection(fileName);
    const faces = result.faceAnnotations;
    // console.log(JSON.stringify(faces, null, 2))
    const leftEyePosition = faces[0].landmarks.find(l => l.type === "LEFT_EYE").position;
    const rightEyePosition = faces[0].landmarks.find(l => l.type === "RIGHT_EYE").position;
    console.log({ leftEyePosition });
    console.log({ rightEyePosition });
    const imageSize = 250
    const halfImageSize = imageSize / 2
    const laserEye = await sharp(laserEyeFilename)
        .resize(imageSize, imageSize)
        .toBuffer();
    const oneEye = await sharp(fileName)
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
