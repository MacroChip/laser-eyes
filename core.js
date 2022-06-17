const sharp = require('sharp')
const vision = require('@google-cloud/vision');

const laserSizeMultiplier = 1.6;

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
        .composite((await Promise.all(faces.map(face => eyesComposites(face, laserEyeFilename, baseMetadata)))).flat())
        .toFile(outputFilename);
}

async function eyesComposites(face, laserEyeFilename, baseMetadata) {
    //this assumes both eyes are same size. that is bad assumption for i.e. angled faces
    const headSize = computeHeadSize(face.landmarks, baseMetadata);
    const halfImageSize = headSize / 2;
    const laserEye = await sharp(laserEyeFilename)
        .resize(headSize, headSize)
        .toBuffer();
    const forehead = face.fdBoundingPoly.vertices[0];
    // console.log(JSON.stringify(forehead, null, 2));
    return [
        {
            left: Math.round(parseFloat(forehead.x)),
            top: Math.round(parseFloat(forehead.y) - halfImageSize),
            input: laserEye
        }
    ];
}

function computeHeadSize(landmarks, baseMetadata) {
    let headSize = parseFloat(getLandmark(landmarks, "RIGHT_EYE_RIGHT_CORNER").x) - parseFloat(getLandmark(landmarks, "LEFT_EYE_LEFT_CORNER").x); //TODO: abs for upsidedown headS? have to see what api does
    headSize = headSize * laserSizeMultiplier;
    return Math.round(Math.min(headSize, baseMetadata.width));
}

function getLandmark(landmarks, type) {
    return landmarks.find(l => l.type === type).position;
}

module.exports = {
    core,
    _core,
}
