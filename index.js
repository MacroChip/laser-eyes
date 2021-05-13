(async () => {
    const sharp = require('sharp')
    const vision = require('@google-cloud/vision');

    const client = new vision.ImageAnnotatorClient();
    const fileName = './images/headshot3.png';
    const laserEyeFilename = './images/red-square.png';

    const [result] = await client.faceDetection(fileName);
    const faces = result.faceAnnotations;
    // console.log(JSON.stringify(faces, null, 2))
    const leftEyePosition = faces[0].landmarks.filter(l => l.type === "LEFT_EYE")[0].position;
    const rightEyePosition = faces[0].landmarks.filter(l => l.type === "RIGHT_EYE")[0].position;
    console.log({ leftEyePosition });
    console.log({ rightEyePosition });
    const oneEye = await sharp(fileName)
        .composite([{
            left: parseInt(leftEyePosition.x) - 10, //TODO: round instead of truncate
            top: parseInt(leftEyePosition.y) - 10,
            input: laserEyeFilename
        }])
        .toBuffer();
    sharp(oneEye).composite([{
        left: parseInt(rightEyePosition.x) - 10,
        top: parseInt(rightEyePosition.y) - 10,
        input: laserEyeFilename
    }])
    .toFile('output.jpg', (err) => {
        console.log("error: ", err)
    });
})()
