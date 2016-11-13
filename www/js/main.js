(function (win) {

    "use strict";

    function main() {

        ImageOverlay
            .initializeMasks([
                'fading/sprites-0.json',
                'fading/sprites-1.json',
                'fading/sprites-2.json'])
            .then(createImage);

    }

    function createImage() {

        var imageOverlay = new ImageOverlay();

        imageOverlay.setRenderSize(600, 400);

        Promise.all([
            imageOverlay.initializeBackgroundImage('image/death-stars-1.jpg'),
            imageOverlay.initializeForegroundImage('image/death-stars-2.jpg')
        ]).then(function () {
            document.body.appendChild(imageOverlay.getCanvas());
        });


    }


    win.addEventListener('load', main, false);

}(window));