const { _core, core } = require('./core.js');

(async () => {
    _core('./images/chip-and-liz.jpg', './laser-flare.webp', 'output.png', require('./test.json'))
    // core('C:\\Users\\Chip\\Downloads\\index2.jpg', './laser-flare.webp', 'output.png')
})()
