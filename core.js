const sharp = require('sharp')
const vision = require('@google-cloud/vision');

async function core(faceFilename, laserEyeFilename, outputFilename) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.faceDetection(faceFilename);
    const faces = result.faceAnnotations;
    if (!faces || !faces[0]) {
        throw "Couldn't find any faces";
    }
    // console.log(JSON.stringify(faces, null, 2))
    const baseImage = sharp(faceFilename);
    const baseImageMetadata = await baseImage.metadata();
    const imageSize = Math.min(baseImageMetadata.width, baseImageMetadata.height, 250);
    const halfImageSize = imageSize / 2;
    const laserEye = await sharp(laserEyeFilename)
        .resize(imageSize, imageSize)
        .toBuffer();
    return baseImage
        .composite(faces.map(face => eyesComposites(face, halfImageSize, laserEye)).flat())
        .toFile(outputFilename);
}

function eyesComposites(face, halfImageSize, laserEye) {
    const leftEyePosition = face.landmarks.find(l => l.type === "LEFT_EYE").position;
    const rightEyePosition = face.landmarks.find(l => l.type === "RIGHT_EYE").position;
    console.log({ leftEyePosition });
    console.log({ rightEyePosition });
    return [
        {
            left: parseInt(leftEyePosition.x) - halfImageSize, //TODO: round instead of truncate
            top: parseInt(leftEyePosition.y) - halfImageSize,
            input: laserEye
        },
        {
            left: parseInt(rightEyePosition.x) - halfImageSize,
            top: parseInt(rightEyePosition.y) - halfImageSize,
            input: laserEye
        }
    ];
}

module.exports = {
    core
}
