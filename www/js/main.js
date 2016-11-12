(function (win) {

    "use strict";

    function main() {

        var imageOverlay = new ImageOverlay();

        imageOverlay
            .initializeImage('image/death-stars.jpg')
            .then(function () {
                document.body.appendChild(imageOverlay.getCanvas());
            });

    }

    win.addEventListener('load', main, false);

}(window));