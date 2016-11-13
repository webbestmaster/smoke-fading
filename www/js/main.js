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
        for (var i = 0; i < 16; i += 1) {
            maskArray.push('switch-page-32-frames-000' + (i < 10 ? '0' : '') + i + '.png');
        }

        imageOverlay.initializeMask(maskArray);

        Promise.all([
            imageOverlay.initializeBackgroundImage('image/death-stars-1.jpg'),
            imageOverlay.initializeForegroundImage('image/death-stars-2.jpg')
        ]).then(function () {
            document.body.appendChild(imageOverlay.getCanvas());

            // var mask = imageOverlay.getMask();
            var mask = PIXI.Sprite.fromFrame('switch-page-32-frames-00003.png');

            mask.width = 600;
            mask.height = 400;

            // mask.animationSpeed = 1;


            imageOverlay.getForegroundSprite().mask = mask;

            imageOverlay.getContainer().addChild(mask);

            // mask.play();

            imageOverlay.getTicker().start();

        });


    }

    win.addEventListener('load', main, false);

}(window));