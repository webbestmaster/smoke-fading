(function (win) {

    "use strict";

    win.ImageOverlay = ImageOverlay;

    // constants
    var BACKGROUND_IMAGE_INDEX = -1;
    var FOREGROUND_IMAGE_INDEX = 1;

    function ImageOverlay() {

        var imageOverlay = this;

        imageOverlay._isActive = false;
        imageOverlay._container = null;
        imageOverlay._renderer = null;
        imageOverlay._ticker = null;
        imageOverlay._masks = [];
        imageOverlay._frameIndex = 0;
        imageOverlay._backgroundSprite = null;
        imageOverlay._foregroundSprite = null;
        imageOverlay._fpsDivider = 1;
        imageOverlay._fpsCounter = 0;

        // create renderer
        imageOverlay._setContainer(new PIXI.Container());
        imageOverlay._setRenderer(PIXI.autoDetectRenderer(128, 128, {
            clearBeforeRender: false
        }));

        imageOverlay._initializeTicker();

    }

    //////////////////////////////////////////////////
    // Updates
    //////////////////////////////////////////////////

    ImageOverlay.prototype._update = function () {

        console.log('_update');

        var imageOverlay = this;
        var fpsDivider = imageOverlay.getFpsDivider();
        var fpsCounter = imageOverlay._getFpsCounter();
        var renderer = imageOverlay.getRenderer();
        var container = imageOverlay.getContainer();

        imageOverlay._increaseFpsCounter();

        if (fpsCounter % fpsDivider !== 0) {
            return;
        }

        renderer.render(container);

        if (imageOverlay.getIsActive()) {
            imageOverlay._updateMask();
        }

    };

    ImageOverlay.prototype._silentUpdate = function () {

        console.log('_silentUpdate');

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();
        var container = imageOverlay.getContainer();

        renderer.render(container);

    };

    //////////////////////////////////////////////////
    // Mask
    //////////////////////////////////////////////////

    ImageOverlay.prototype.addMask = function (pathToImageList) {

        var imageOverlay = this;

        var options = {
            flipX: !getRandomBetween(2),
            flipY: !getRandomBetween(2)
        };

        return Promise.all(pathToImageList.map(function (pathToImage) {
            return imageOverlay._initializeMaskSprite(pathToImage, options);
        })).then(function (masks) {
            imageOverlay._pushMask(masks);
            imageOverlay._silentUpdate();
        });

    };

    ImageOverlay.prototype.playMask = function () {

        var imageOverlay = this;
        var ticker = imageOverlay.getTicker();

        imageOverlay._setIsActive(true);

        imageOverlay._setFrameIndex(0);

        ticker.start();

    };

    ImageOverlay.prototype._initializeMaskSprite = function (pathToImage, options) {

        var imageOverlay = this;

        var foregroundSprite = imageOverlay.getForegroundSprite();
        var container = imageOverlay.getContainer();

        var renderer = imageOverlay.getRenderer();

        var rendererWidth = renderer.width;
        var rendererHeight = renderer.height;

        var centerX = rendererWidth / 2;
        var centerY = rendererHeight / 2;

        return imageOverlay.initializeImage(pathToImage).then(function (maskSprite) {

            imageOverlay._fitToRenderSize(maskSprite);

            var newSprite = new PIXI.Sprite(foregroundSprite.texture);
            imageOverlay._fitToRenderSize(newSprite);

            container.addChildAt(maskSprite, 0);

            maskSprite.scale.set(
                options.flipX ? -1 : 1,
                options.flipY ? -1 : 1
            );

            maskSprite.position.set(centerX, centerY);
            maskSprite.anchor.set(0.5, 0.5);

            imageOverlay._fitToRenderSize(maskSprite);

            newSprite.mask = maskSprite;

            return newSprite;

        });

    };

    ImageOverlay.prototype._updateMask = function () {

        var imageOverlay = this;
        var mask = imageOverlay.getMask();
        var frameIndex = imageOverlay.getFrameIndex();
        // var foregroundSprite = imageOverlay.getForegroundSprite();
        var backgroundSprite = imageOverlay.getBackgroundSprite();
        var currentFrameIndex = Math.floor(frameIndex);
        var container = imageOverlay.getContainer();

        imageOverlay._cleanContainer();
        // imageOverlay._fitToRenderSize(backgroundSprite);
        container.addChild(backgroundSprite);

        console.log('update mask');

        if (currentFrameIndex >= mask.length) {
            console.log('stop');
            imageOverlay._setIsActive(false);
            imageOverlay._silentUpdate();
            imageOverlay.getTicker().stop();
        } else {
            console.log('update frame');
            container.addChild(mask[currentFrameIndex]);
            imageOverlay._setFrameIndex(frameIndex + 1);
        }

    };

    //////////////////////////////////////////////////
    // Ticker
    //////////////////////////////////////////////////

    ImageOverlay.prototype._initializeTicker = function () {

        var ticker = new PIXI.ticker.Ticker();
        var imageOverlay = this;

        ticker.autoStart = false;

        ticker.add(imageOverlay._update, imageOverlay);

        imageOverlay._setTicker(ticker);

    };

    ImageOverlay.prototype._destroyTicker = function () {

        var imageOverlay = this;

        var ticker = imageOverlay.getTicker();

        ticker.remove(imageOverlay._update, imageOverlay);
        ticker.stop();

    };

    //////////////////////////////////////////////////
    // Sprite initializing
    //////////////////////////////////////////////////

    ImageOverlay.prototype.initializeImage = function (pathToImage) {

        return new Promise(function (resolve, reject) {

            var cachedTexture = PIXI.utils.TextureCache[pathToImage];

            var sprite = new PIXI.Sprite.fromImage(pathToImage);

            if (cachedTexture && cachedTexture.baseTexture.hasLoaded) {
                resolve(sprite);
                return;
            }

            sprite
                .texture.baseTexture
                .once('loaded', function () {
                    resolve(sprite);
                })
                .once('error', reject);

        });

    };

    ImageOverlay.prototype.initializeBackgroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage)
            .then(function (sprite) {
                imageOverlay.addSprite(sprite, BACKGROUND_IMAGE_INDEX);
                imageOverlay._fitToRenderSize(sprite);
                imageOverlay._setBackgroundSprite(sprite);
            });

    };

    ImageOverlay.prototype.initializeForegroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage)
            .then(function (sprite) {
                imageOverlay.addSprite(sprite, FOREGROUND_IMAGE_INDEX);
                imageOverlay._fitToRenderSize(sprite);
                imageOverlay._setForegroundSprite(sprite);
            });

    };


    //////////////////////////////////////////////////
    // Render
    //////////////////////////////////////////////////

    ImageOverlay.prototype.setRenderSize = function (width, height) {

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();

        renderer.resize(width, height);

    };

    ImageOverlay.prototype.addSprite = function (sprite, zIndex) {

        var imageOverlay = this;
        var container = imageOverlay.getContainer();

        container.addChild(sprite);

        sprite.zIndex = zIndex || 0;

        container.children.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });

        imageOverlay._silentUpdate();

    };

    ImageOverlay.prototype._cleanContainer = function () {

        var imageOverlay = this;
        var container = imageOverlay.getContainer();

        while (container.children.length > 0) {
            container.removeChild(container.getChildAt(0));
        }

    };

    ImageOverlay.prototype._fitToRenderSize = function (sprite) {

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();

        sprite.width = renderer.width;
        sprite.height = renderer.height;

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
        var masks = this._masks;
        return masks[getRandomBetween(masks.length)];
    };

    ImageOverlay.prototype._pushMask = function (spritesList) {
        return this._masks.push(spritesList);
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


    ImageOverlay.prototype.getFpsDivider = function () {
        return this._fpsDivider;
    };

    ImageOverlay.prototype.setFpsDivider = function (fpsCoefficient) {
        return this._fpsDivider = Math.round(fpsCoefficient);
    };


    ImageOverlay.prototype._getFpsCounter = function () {
        return this._fpsCounter;
    };

    ImageOverlay.prototype._setFpsCounter = function (fpsCounter) {
        return this._fpsCounter = fpsCounter;
    };

    ImageOverlay.prototype._increaseFpsCounter = function () {
        return this._fpsCounter += 1;
    };

    //////////////////////////////////////////////////
    // Helper
    //////////////////////////////////////////////////

    function getRandomBetween(start, stop) {

        if (arguments.length === 1) {
            stop = start;
            start = 0;
        }

        return Math.floor(Math.random() * (stop - start) + start);

    }

    ImageOverlay.utils = {

        createPixel: function createPixel(color, opacity) {

            var svgSrc = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1px" height="1px" viewBox="0 0 1 1" ><rect {{attr}} x="0" y="0" width="1" height="1"/></svg>';

            var attr;

            if (color === undefined || color === null) {
                color = '000000';
            }

            if (opacity === undefined || opacity === null) {
                opacity = '1';
            }

            attr = 'fill="#' + color + '" fill-opacity="' + opacity + '"';

            svgSrc = svgSrc.replace('{{attr}}', attr);

            return 'data:image/svg+xml;base64,' + window.btoa(svgSrc);

        }

    };


}(window));
