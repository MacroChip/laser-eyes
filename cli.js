const { _core, core } = require('./core.js');

(async () => {
    // _core('./images/chip-and-liz.jpg', './blue-laser-eye.png', 'output.png', require('./test.json'));
    _core('./images/chip-and-liz.jpg', './laser-flare.webp', 'output.png', require('./test.json'));
    // core('C:\\Users\\Chip\\Downloads\\index2.jpg', './laser-flare.webp', 'output.png');
})()
