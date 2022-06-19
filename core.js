const sharp = require('sharp')
const vision = require('@google-cloud/vision');

const laserSizeMultiplier = 1.6;
const FULL_ALPHA = "#00000000";

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
    const headSize = computeHeadSize(face, baseMetadata);
    const halfImageSize = headSize / 2;
    console.log(`roll`, face.rollAngle)
    const laserEye = await sharp(laserEyeFilename)
        .rotate(face.rollAngle, { background: FULL_ALPHA })
        .flop(!!(face.panAngle < 0))
        .resize(headSize, null)
        .toBuffer();
    const forehead = face.fdBoundingPoly.vertices[0];
    // console.log(JSON.stringify(forehead, null, 2));
    return [
        {
            left: Math.round(parseFloat(forehead.x)),
            top: Math.round(parseFloat(getLandmark(face.landmarks, "FOREHEAD_GLABELLA").y) - headSize / 1.25),
            input: laserEye,
        }
    ];
}

function computeHeadSize(face, baseMetadata) {
    let headSize = parseFloat(face.fdBoundingPoly.vertices[1].x) - parseFloat(face.fdBoundingPoly.vertices[0].x); //TODO: abs for upsidedown headS? have to see what api does
    // headSize = headSize * laserSizeMultiplier;
    return Math.round(Math.min(headSize, baseMetadata.width));
}

function getLandmark(landmarks, type) {
    return landmarks.find(l => l.type === type).position;
}

module.exports = {
    core,
    _core,
}
