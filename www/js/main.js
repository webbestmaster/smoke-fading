(function (win) {

    "use strict";

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(480, 320);

        imageOverlay.setFpsDivider(60);

        // from fade
        var image1 = 'image/1photo.jpg';
        var image2 = 'image/2photo.jpg';

        // from tanks
        // var image1 = 'image/1photo.jpg';
        // var image2 = 'image/2photo.jpg';

        Promise.all([
            // imageOverlay.initializeBackgroundImage('image/1photo.jpg'),
            // imageOverlay.initializeBackgroundImage(image1),
            imageOverlay.initializeBackgroundImage(ImageOverlay.utils.createPixel(null, 0)),
            imageOverlay.initializeForegroundImage(image2)
        ]).then(function () {

            var masksArray = [[],[]],
                i;

            for (i = 0; i < 16; i += 1) {
                masksArray[0].push('fading-src/fade-1st-' + (i < 10 ? '0' : '') + i + '.png');
            }
            masksArray[0].push(ImageOverlay.utils.createPixel(null, 1));

            for (i = 0; i < 16; i += 1) {
                masksArray[1].push('fading-src/fade-2nd-' + (i < 10 ? '0' : '') + i + '.png');
            }
            masksArray[1].push(ImageOverlay.utils.createPixel(null, 1));

            var maskOptions = {
                flipX: null, // true or false, if flipX is not passed or flipX === null - will be get random value
                flipY: null, // true or false, if flipY is not passed or flipY === null - will be get random value
                isInvert: true // true or false, invert colors (RGB only, not Alpha), default value - false
            };

            return Promise.all([
                imageOverlay.addMask(masksArray[0], maskOptions),
                imageOverlay.addMask(masksArray[1], maskOptions)
            ]);

        }).then(function () {

            document.body.appendChild(imageOverlay.getCanvas());

            imageOverlay.drawMaskIndex(0);

            imageOverlay.playMask().then(function () {
                imageOverlay.drawMaskIndex(16);
                console.log('play is end!!!222');
            });

        });

    }

    win.addEventListener('load', createImage, false);

}(window));