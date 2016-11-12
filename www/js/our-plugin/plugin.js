(function (win) {

    "use strict";

    win.ImageOverlay = ImageOverlay;

    function ImageOverlay() {

        var imageOverlay = this;

        // create renderer
        imageOverlay._setContainer(new PIXI.Container());
        imageOverlay._setRenderer(PIXI.autoDetectRenderer(128, 128));

        imageOverlay._initializeTicker();

    }

    ImageOverlay.prototype.initializeMasks = function (jsons) {
        // TODO: implement this
    };

    ImageOverlay.prototype.initializeBackgroundImage = function (pathToImage) {

        var imageOverlay = this;
        var container = imageOverlay.getContainer();
        var renderer = imageOverlay.getRenderer();

        return new Promise(function (resolve, reject) {

            var sprite = new PIXI.Sprite.fromImage(pathToImage);

            sprite
                .texture.baseTexture
                .on('loaded', function () {
                    renderer.resize(sprite.width, sprite.height);
                    container.addChildAt(sprite, 0);
                    imageOverlay._update();
                    resolve();
                })
                .on('error', reject);

        });

    };

    //////////////////////////////////////////////////
    // Private methods and properties
    //////////////////////////////////////////////////

    ImageOverlay.prototype._update = function () {
        console.log('_update');
        this._renderer.render(this._container);
    };

    ImageOverlay.prototype._container = null;
    ImageOverlay.prototype._renderer = null;
    ImageOverlay.prototype._ticker = null;

    //////////////////////////////////////////////////
    // Ticker
    //////////////////////////////////////////////////

    ImageOverlay.prototype._initializeTicker = function () {

        var ticker = new PIXI.ticker.Ticker();
        var imageOverlay = this;

        ticker.add(imageOverlay._update, imageOverlay);

        ticker.stop();

        imageOverlay._setTicker(ticker);

    };

    ImageOverlay.prototype._destroyTicker = function () {

        var imageOverlay = this;

        var ticker = imageOverlay.getTicker();

        ticker.remove(imageOverlay._update, imageOverlay);
        ticker.stop();

    };

    //////////////////////////////////////////////////
    // Getters / Setters
    //////////////////////////////////////////////////

    // only GET
    ImageOverlay.prototype.getCanvas = function () {
        return this._renderer.view;
    };


    ImageOverlay.prototype.getTicker = function () {
        return this._ticker;
    };

    ImageOverlay.prototype._setTicker = function (ticker) {
        return this._ticker = ticker;
    };


    ImageOverlay.prototype.getRenderer = function () {
        return this._renderer;
    };

    ImageOverlay.prototype._setRenderer = function (renderer) {
        return this._renderer = renderer;
    };


    ImageOverlay.prototype.getContainer = function () {
        return this._container;
    };

    ImageOverlay.prototype._setContainer = function (container) {
        return this._container = container;
    };

}(window));
