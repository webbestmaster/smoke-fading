(function (win) {

    "use strict";

    win.addEventListener('load', function () {

        var masksArray = [[],[]],
            i;

        for (i = 0; i < 16; i += 1) {
            masksArray[0].push('fading-src/fade-1st-' + (i < 10 ? '0' : '') + i + '.png');
        }
        // masksArray[0].push(ImageOverlay.utils.createPixel(null, 1));

        for (i = 0; i < 16; i += 1) {
            masksArray[1].push('fading-src/fade-2nd-' + (i < 10 ? '0' : '') + i + '.png');
        }

        var imageOverlay = new ImageOverlay({
            bg: 'image/1photo.jpg',
            fg: 'image/2photo.jpg', // * must be defined * if you use other properties
            masks: masksArray, // array of arrays of mask,
            options: {
                flipX: null, // true or false, if flipX is not passed or flipX === null - will be get random value
                flipY: null, // true or false, if flipY is not passed or flipY === null - will be get random value
                isInvert: true // true or false, invert colors (RGB only, not Alpha), default value - false
            },
            success: function () {
                console.log('yyyyyy');

                var imageOverlay = this;

                document.body.appendChild(imageOverlay.getCanvas());

                imageOverlay.playMask('end', -1).then(function () {
                    console.log('play is end!!!');
                });

            },
            error: function () {
                var imageOverlay = this;
                console.log('nnooooo');
            }

        });



        console.log(imageOverlay);


    }, false);


}(window));