(function (win) {

    "use strict";

    win.ImageOverlay = ImageOverlay;

    // constants
    var BACKGROUND_IMAGE_INDEX = -1;
    var FOREGROUND_IMAGE_INDEX = 1;

    function ImageOverlay() {

        var imageOverlay = this;

        // create renderer
        imageOverlay._setContainer(new PIXI.Container());
        imageOverlay._setRenderer(PIXI.autoDetectRenderer(128, 128));

        imageOverlay._initializeTicker();

    }

    ImageOverlay.initializeMasks = function (jsonsList) {

        return new Promise(function (resolve, reject) {

            var loader = new PIXI.loaders.Loader();

            jsonsList.forEach(loader.add, loader);

            loader.once('complete', resolve);
            loader.once('error', reject);

            loader.load();

        });

    };

    ImageOverlay.prototype.setRenderSize = function (width, height) {

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();

        renderer.resize(width, height);

    };

    ImageOverlay.prototype.initializeImage = function (pathToImage, zIndex) {

        var imageOverlay = this;

        return new Promise(function (resolve, reject) {

            var sprite = new PIXI.Sprite.fromImage(pathToImage);

            sprite
                .texture.baseTexture
                .on('loaded', function () {
                    imageOverlay.addSprite(sprite, zIndex);
                    resolve();
                })
                .on('error', reject);

        });

    };

    ImageOverlay.prototype.initializeBackgroundImage = function (pathToImage) {
        return this.initializeImage(pathToImage, BACKGROUND_IMAGE_INDEX);
    };

    ImageOverlay.prototype.initializeForegroundImage = function (pathToImage) {
        return this.initializeImage(pathToImage, FOREGROUND_IMAGE_INDEX);
    };

    ImageOverlay.prototype.addSprite = function (sprite, zIndex) {

        var imageOverlay = this;
        var container = imageOverlay.getContainer();

        container.addChild(sprite);

        sprite.zIndex = zIndex || 0;

        container.children.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });

        imageOverlay._update();

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
