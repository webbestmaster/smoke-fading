(function (win) {

    "use strict";

/*
    function main() {

        ImageOverlay
            .loadAssets([
                'fading/fade.json'
            ])
            .then(createImage);

    }
*/

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(600, 400);


        Promise.all([
            imageOverlay.initializeBackgroundImage('image/death-stars-1.jpg'),
            imageOverlay.initializeForegroundImage('image/death-stars-2.jpg')
        ]).then(function () {

            var maskArray = [];

            for (var i = 0; i < 16; i += 1) {
                maskArray.push('fading-src/fade-1st-' + (i < 10 ? '0' : '') + i + '.png');
            }

            imageOverlay.initializeMask(maskArray);

            document.body.appendChild(imageOverlay.getCanvas());

            setTimeout(function () {
                imageOverlay.playMask()
            }, 1000);


            // var mask = imageOverlay.getMask();
            // var mask = PIXI.Sprite.fromFrame('switch-page-32-frames-00008.png');

            // mask.width = 600;
            // mask.height = 400;

            // mask.animationSpeed = 1;


            // imageOverlay.getForegroundSprite().mask = mask;
            //
            // imageOverlay.getContainer().addChild(mask);

            // mask.play();

            // imageOverlay.getTicker().start();

        });

    }

    win.addEventListener('load', createImage, false);
    // win.addEventListener('load', main, false);

}(window));