const sharp = require('sharp')
const vision = require('@google-cloud/vision');

const laserSizeMultiplier = 8;

async function core(faceFilename, laserEyeFilename, outputFilename) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.faceDetection(faceFilename);
    return _core(faceFilename, laserEyeFilename, outputFilename, result);
}

async function _core(faceFilename, laserEyeFilename, outputFilename, result) {
    const faces = result.faceAnnotations;
    if (!faces || !faces[0]) {
        throw "Couldn't find any faces";
    }
    console.log(JSON.stringify(faces, null, 2));
    const base = sharp(faceFilename);
    const baseMetadata = await base.metadata();
    return base
        .composite((await Promise.all(faces.map(face => eyesComposites(face.landmarks, laserEyeFilename, baseMetadata)))).flat())
        .toFile(outputFilename);
}

async function eyesComposites(landmarks, laserEyeFilename, baseMetadata) {
    //this assumes both eyes are same size. that is bad assumption for i.e. angled faces
    const eyeSize = computeEyeSize(landmarks, baseMetadata);
    const halfImageSize = eyeSize / 2;
    const laserEye = await sharp(laserEyeFilename)
        .resize(eyeSize, eyeSize)
        .toBuffer();
    const leftEyePosition = getLandmark(landmarks, "LEFT_EYE");
    const rightEyePosition = getLandmark(landmarks, "RIGHT_EYE");
    console.log(JSON.stringify(leftEyePosition, null, 2));
    console.log(JSON.stringify(rightEyePosition, null, 2));
    return [
        {
            left: Math.round(parseFloat(leftEyePosition.x) - halfImageSize),
            top: Math.round(parseFloat(leftEyePosition.y) - halfImageSize),
            input: laserEye
        },
        {
            left: Math.round(parseFloat(rightEyePosition.x) - halfImageSize),
            top: Math.round(parseFloat(rightEyePosition.y) - halfImageSize),
            input: laserEye
        }
    ];
}

function computeEyeSize(landmarks, baseMetadata) {
    let eyeSize = parseFloat(getLandmark(landmarks, "LEFT_EYE_RIGHT_CORNER").x) - parseFloat(getLandmark(landmarks, "LEFT_EYE_LEFT_CORNER").x); //TODO: abs for upsidedown headS? have to see what api does
    eyeSize = eyeSize * laserSizeMultiplier;
    return Math.round(Math.min(eyeSize, baseMetadata.width));
}

function getLandmark(landmarks, type) {
    return landmarks.find(l => l.type === type).position;
}

module.exports = {
    core,
    _core,
}
