(async () => {
    const sharp = require('sharp')
    const vision = require('@google-cloud/vision');

    const client = new vision.ImageAnnotatorClient();
    const fileName = './images/headshot3.png';
    const laserEyeFilename = './images/laser-flare.webp';

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
    sharp(oneEye).composite([{
        left: parseInt(rightEyePosition.x) - halfImageSize,
        top: parseInt(rightEyePosition.y) - halfImageSize,
        input: laserEye
    }])
    .toFile('output.jpg', (err) => {
        console.log("error: ", err)
    });
})()
