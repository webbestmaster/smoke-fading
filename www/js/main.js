(function (win) {

    "use strict";

    function main() {

        ImageOverlay
            .loadAssets([
                'fading/sprites-0.json',
                'fading/sprites-1.json',
                'fading/sprites-2.json'])
            .then(createImage);

    }

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(600, 400);

        var maskArray = [];
        for (var i = 17; i < 32; i += 1) {
            maskArray.push('switch-page-32-frames-000' + (i < 10 ? '0' : '') + i + '.png');
        }

        imageOverlay.initializeMask(maskArray);

        Promise.all([
            imageOverlay.initializeBackgroundImage('image/death-stars-1.jpg'),
            imageOverlay.initializeForegroundImage('image/death-stars-2.jpg')
        ]).then(function () {
            document.body.appendChild(imageOverlay.getCanvas());


            imageOverlay.getMask().width = 600;
            imageOverlay.getMask().height = 400;
            imageOverlay.getMask().loop = false;

            imageOverlay.getContainer().addChild(imageOverlay.getMask());
            imageOverlay.getTicker().start();

            imageOverlay.getMask().play();

        });


    }

    win.addEventListener('load', main, false);

}(window));