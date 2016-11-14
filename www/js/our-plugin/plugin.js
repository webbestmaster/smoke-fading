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
        imageOverlay._setRenderer(PIXI.autoDetectRenderer(128, 128, {
            clearBeforeRender: false
            // preserveDrawingBuffer: true
        }));

        imageOverlay._initializeTicker();

    }

    ImageOverlay.loadAssets = function (jsonsList) {

        return new Promise(function (resolve, reject) {

            var loader = new PIXI.loaders.Loader();

            loader.add(jsonsList);

            loader.on('error', reject);

            loader.load(resolve);

        });

    };


    ImageOverlay.prototype.initializeMask = function (pathToImageList) {

        var imageOverlay = this;

        pathToImageList = pathToImageList.reverse();

        var foregroundSprite = imageOverlay.getForegroundSprite();
        // var backgroundSprite = imageOverlay.getBackgroundSprite();
        var renderer = imageOverlay.getRenderer();
        var rendererWidth = renderer.width;
        var rendererHeight = renderer.height;
        var container = imageOverlay.getContainer();

        imageOverlay._setFrameIndex(0);

        imageOverlay._setMask(pathToImageList.map(function (pathToImage) {

            var maskSprite = new PIXI.Sprite.fromImage(pathToImage);
            var newSprite = new PIXI.Sprite(foregroundSprite.texture);

            maskSprite.width = rendererWidth;
            maskSprite.height = rendererHeight;

            container.addChild(maskSprite);

            newSprite.mask = maskSprite;

            return newSprite;

        }));

    };

    ImageOverlay.prototype.playMask = function () {

        var imageOverlay = this;
        var ticker = imageOverlay.getTicker();

        imageOverlay._setIsActive(true);

        imageOverlay._setFrameIndex(0);

        ticker.start();

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


    // var counter = 0;

    ImageOverlay.prototype._update = function () {

        console.log('_update');

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();
        var container = imageOverlay.getContainer();

        renderer.render(container);

        if (imageOverlay.getIsActive()) {
            imageOverlay._updateMask();
        }

    };

    ImageOverlay.prototype._updateMask = function () {

        var imageOverlay = this;
        var mask = imageOverlay.getMask();
        var frameIndex = imageOverlay.getFrameIndex();
        var foregroundSprite = imageOverlay.getForegroundSprite();
        var backgroundSprite = imageOverlay.getBackgroundSprite();
        var currentFrameIndex = Math.floor(frameIndex);
        var container = imageOverlay.getContainer();

        while (container.children.length > 1) { // leave background only
            container.removeChild(container.getChildAt(1));
        }

        if (currentFrameIndex >= mask.length) {

            console.log('stop');
            imageOverlay._setIsActive(false);
            // container.addChild(backgroundSprite);
            // foregroundSprite.mask = null;
            imageOverlay._update();
            imageOverlay.getTicker().stop();

        } else {

            console.log('update frame');

            // container.addChild(backgroundSprite);
            container.addChild(mask[currentFrameIndex]);

            imageOverlay._setFrameIndex(frameIndex + 1);

        }

    };

    ImageOverlay.prototype._isActive = false;
    ImageOverlay.prototype._container = null;
    ImageOverlay.prototype._renderer = null;
    ImageOverlay.prototype._ticker = null;
    ImageOverlay.prototype._mask = null;
    ImageOverlay.prototype._frameIndex = 0;
    ImageOverlay.prototype._backgroundSprite = null;
    ImageOverlay.prototype._foregroundSprite = null;

    //////////////////////////////////////////////////
    // Ticker
    //////////////////////////////////////////////////

    ImageOverlay.prototype._initializeTicker = function () {

        var ticker = new PIXI.ticker.Ticker();
        var imageOverlay = this;

        ticker.autoStart = false;

        ticker.speed = 0.2;

        ticker.add(imageOverlay._update, imageOverlay);

        ticker.speed = 0.2;

        // ticker.stop();

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

    ImageOverlay.prototype._setMask = function (spritesList) {
        return this._mask = spritesList;
    };


    ImageOverlay.prototype.getIsActive = function () {
        return this._isActive;
    };

    ImageOverlay.prototype._setIsActive = function (isActive) {
        return this._isActive = isActive;
    };


    ImageOverlay.prototype.getFrameIndex = function () {
        return this._frameIndex;
    };

    ImageOverlay.prototype._setFrameIndex = function (frameIndex) {
        return this._frameIndex = frameIndex;
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
