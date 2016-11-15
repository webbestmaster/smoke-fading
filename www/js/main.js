(function (win) {

    "use strict";

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(1440, 884);

        imageOverlay.setFpsDivider(1);

        Promise.all([
            // imageOverlay.initializeBackgroundImage('image/1photo.jpg'),
            imageOverlay.initializeBackgroundImage('image/nicole-croisille-visual.jpg'),
            imageOverlay.initializeForegroundImage('image/france-rugby-visual.jpg')
        ]).then(function () {

            var masksArray = [[],[]],
                i;

            for (i = 0; i < 16; i += 1) {
                masksArray[0].push('fading-src/fade-1st-' + (i < 10 ? '0' : '') + i + '.png');
            }

            for (i = 0; i < 16; i += 1) {
                masksArray[1].push('fading-src/fade-2nd-' + (i < 10 ? '0' : '') + i + '.png');
            }

            return Promise.all([
                imageOverlay.addMask(masksArray[0])
                // imageOverlay.addMask(masksArray[1])
            ]);

        }).then(function () {
            document.body.appendChild(imageOverlay.getCanvas());

            setTimeout(function () {
                imageOverlay.playMask();
            }, 2000);

        });

    }

    win.addEventListener('load', createImage, false);

}(window));