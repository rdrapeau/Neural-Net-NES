var React = require('react');
var JSNES = require('../../vendor/nes_emu/jsnes');

// Ignore this ugliness
var reactToNESUIShim = function(reactClass) {
    console.log(reactClass);
    return function(nes) {
        this.enable = reactClass.enable;
        this.updateStatus = reactClass.updateStatus;
        this.writeAudio = reactClass.writeAudio;
        this.writeFrame = reactClass.writeFrame;

        reactClass.initNES(nes);
    };
};

var WIDTH = 256;
var HEIGHT = 240;

var NESComponent = React.createClass({
    canvasContext: null,
    canvasImageData: null,

    initNES: function(nes) {
        console.log(nes);
        this.cls();
    },

    updateStatus: function(status) {
        // Not important again
    },

    writeAudio: function(samples) {
        // Do something?
    },

    writeFrame: function(buffer, prevBuffer) {
        var imageData = this.canvasImageData.data;
        var pixel, i, j;

        for (i=0; i<WIDTH*HEIGHT; i++) {
            pixel = buffer[i];

            if (pixel != prevBuffer[i]) {
                j = i*4;
                imageData[j] = pixel & 0xFF;
                imageData[j+1] = (pixel >> 8) & 0xFF;
                imageData[j+2] = (pixel >> 16) & 0xFF;
                prevBuffer[i] = pixel;
            }
        }

        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    },

    cls: function() {
        this.canvasContext.fillStyle = 'black';
        // set alpha to opaque
        this.canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

        // Set alpha
        for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
            this.canvasImageData.data[i] = 0xFF;
        }
    },

    enable: function() {
        // Also called by emulator, not much to do here
    },

    getInitialState : function() {
        return {};
    },

    componentDidMount : function() {
        this.canvasContext = this.refs.screen.getContext('2d'),
        this.canvasImageData = this.canvasContext.getImageData(0, 0, WIDTH, HEIGHT);

        var uiShim = reactToNESUIShim(this);
        new JSNES({ui: uiShim});
    },

    render : function() {
        return (
            <div ref="container">
                <canvas ref="screen" className="nes-screen" width="256" height="240"></canvas>
            </div>
        );
	}
});

module.exports = NESComponent;