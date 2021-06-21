const { _core, core } = require('./core.js');

(async () => {
    _core('./images/chip-and-liz.jpg', './images/red-square2.png', 'output.png', require('./test.json'))
})()
