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
    let laseredEyes = putEyesOnOneFace(faces[0], baseImage, baseImageMetadata, laserEyeFilename, outputFilename);
    for (face in faces.slice(1)) {
        laseredEyes = putEyesOnOneFace(face, outputFilename, baseImageMetadata, laserEyeFilename, outputFilename);
    }
    return laseredEyes;
}

function putEyesOnOneFace(face, baseImage, baseImageMetadata, laserEyeFilename, outputFilename) {
    const leftEyePosition = face.landmarks.find(l => l.type === "LEFT_EYE").position;
    const rightEyePosition = face.landmarks.find(l => l.type === "RIGHT_EYE").position;
    console.log({ leftEyePosition });
    console.log({ rightEyePosition });
    const imageSize = Math.min(baseImageMetadata.width, baseImageMetadata.height, 250);
    const halfImageSize = imageSize / 2
    const laserEye = await sharp(laserEyeFilename)
        .resize(imageSize, imageSize)
        .toBuffer();
    const oneEye = await baseImage
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
