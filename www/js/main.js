(function (win) {

    "use strict";

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(320, 280);

        imageOverlay.setFpsDivider(60);

        Promise.all([
            imageOverlay.initializeBackgroundImage('image/cat-1.jpg'),
            imageOverlay.initializeForegroundImage('image/cat-2.jpg')
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
                imageOverlay.addMask(masksArray[0]),
                imageOverlay.addMask(masksArray[1])
            ]);

        }).then(function () {
            document.body.appendChild(imageOverlay.getCanvas());
            imageOverlay.playMask();
        });

    }

    win.addEventListener('load', createImage, false);
    win.addEventListener('load', function () {
        setTimeout(createImage, 0);
        setTimeout(createImage, 0);
        setTimeout(createImage, 0);
        setTimeout(createImage, 0);
        setTimeout(createImage, 0);
    }, false);
    // win.addEventListener('load', main, false);

}(window));