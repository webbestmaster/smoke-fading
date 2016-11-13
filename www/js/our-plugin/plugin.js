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

    ImageOverlay.loadAssets = function (jsonsList) {

        return new Promise(function (resolve, reject) {

            var loader = new PIXI.loaders.Loader();

            // jsonsList.forEach(loader.add, loader);

            loader.add(jsonsList);

            loader.on('progress', function () {
                console.log('loaded');
            });

            // loader.on('complete', resolve);
            // loader.on('load', resolve);
            loader.once('error', reject);

            loader.load(resolve);

        });

    };


    ImageOverlay.prototype.initializeMask = function (pathToImageList) {

        var imageOverlay = this;

        var movieClip = new PIXI.extras.MovieClip(pathToImageList.map(function (pathToImage) {
            // return PIXI.Texture.fromFrame(pathToImage);
            return PIXI.Texture.fromImage(pathToImage);
        }));

        imageOverlay._setMask(movieClip);

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
                    resolve(sprite);
                })
                .on('error', reject);

        });

    };

    ImageOverlay.prototype.initializeBackgroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage, BACKGROUND_IMAGE_INDEX)
            .then(function (sprite) {
                imageOverlay._setBackgroundSprite(sprite);
            });

    };

    ImageOverlay.prototype.initializeForegroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage, FOREGROUND_IMAGE_INDEX)
            .then(function (sprite) {
                imageOverlay._setForegroundSprite(sprite);
            });

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
    ImageOverlay.prototype._mask = null;
    ImageOverlay.prototype._backgroundSprite = null;
    ImageOverlay.prototype._foregroundSprite = null;

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


    ImageOverlay.prototype.getMask = function () {
        return this._mask;
    };

    ImageOverlay.prototype._setMask = function (movieClip) {
        return this._mask = movieClip;
    };


    ImageOverlay.prototype.getBackgroundSprite = function () {
        return this._backgroundSprite;
    };

    ImageOverlay.prototype._setBackgroundSprite = function (sprite) {
        return this._backgroundSprite = sprite;
    };


    ImageOverlay.prototype.getForegroundSprite = function () {
        return this._foregroundSprite;
    };

    ImageOverlay.prototype._setForegroundSprite = function (sprite) {
        return this._foregroundSprite = sprite;
    };


}(window));
