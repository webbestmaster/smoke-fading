(function (win) {

    "use strict";

    win.ImageOverlay = ImageOverlay;

    // constants
    var BACKGROUND_IMAGE_INDEX = -1;
    var FOREGROUND_IMAGE_INDEX = 1;

    /**
     * @constructor
     * @param {Object} [options] - options for constructor
         * @param {String} [options.bg] - path to background image, you can use .initializeBackgroundImage()
         * @param {String}  options.fg  - path to foreground image, you can use .initializeForegroundImage()
         * @param {Array[]} [options.masks] - array of masks, you can use .addMask()
             * @param {Array[]} [options.masks[i]] - one mask
                 * @param {String} [options.masks[i][j]] - path to one mask image
         * @param {Object} [options.options] - options of masks, you can use .addMask() with options
             * @param {Boolean|null} [options.options.flipX=true|false-will be get random] - need to flip by X axis
             * @param {Boolean|null} [options.options.flipY=true|false-will be get random] - need to flip by Y axis
             * @param {Boolean|null} [options.options.isInvert=false] - need to invert white/black of mask
         * @param {Function} [options.success] - callback on success
         * @param {Function} [options.error] - callback on error
     */
    function ImageOverlay(options) {

        var imageOverlay = this;

        imageOverlay._defineDefaultProperties();

        // create renderer
        imageOverlay._setContainer(new PIXI.Container());
        imageOverlay._setRenderer(PIXI.autoDetectRenderer(128, 128, {
            transparent: true
        }));

        imageOverlay._initializeTicker();

        if (options) {
            imageOverlay._parseOptions(options);
        }

    }

    //////////////////////////////////////////////////
    // Initialization
    //////////////////////////////////////////////////

    /**
     * @param options - see @constructor
     * @private
     */
    ImageOverlay.prototype._parseOptions = function (options) {

        var imageOverlay = this;

        var p;

        var foregroundImagePath = options.fg;
        var backgroundImagePath = options.bg;

        if (backgroundImagePath) {
            p = Promise.all([
                imageOverlay.initializeForegroundImage(foregroundImagePath),
                imageOverlay.initializeBackgroundImage(backgroundImagePath)
            ]);
        } else {
            p = imageOverlay
                .initializeForegroundImage(foregroundImagePath).then(function () {
                    return imageOverlay.initializeBackgroundImage(ImageOverlay.utils.createPixel(null, 0));
                })
                .then(function () {
                    // hide sprite from renderer
                    var backgroundSprite = imageOverlay.getBackgroundSprite();
                    backgroundSprite.alpha = 0;
                    backgroundSprite.visible = 0;
                    backgroundSprite.renderable = 0;
                });
        }

        if (options.masks) {
            p = p.then(function () {
                return Promise.all(options.masks.map(function (mask) {
                    return imageOverlay.addMask(mask, options.options)
                }));
            });
        }

        p.then(function () {
            options.success && options.success.call(imageOverlay);
        }).catch(function () {
            options.error && options.error.call(imageOverlay);
        });

    };

    /**
     * @private
     */
    ImageOverlay.prototype._defineDefaultProperties = function () {

        var imageOverlay = this;

        // active or not imageOverlay
        imageOverlay._isActive = false;

        // PIXI.Container
        imageOverlay._container = null;

        // PIXI.Renderer
        imageOverlay._renderer = null;

        // PIXI.Ticker
        imageOverlay._ticker = null;

        // Array of masks, f.e. [[1.jpg, 2.jpg], [3.jpg, 4.jpg]]
        imageOverlay._masks = [];

        // Current mask's index
        imageOverlay._frameIndex = 0;

        // PIXI.Sprite
        imageOverlay._backgroundSprite = null;

        // PIXI.Sprite
        imageOverlay._foregroundSprite = null;

        // FPS divider,
        // f. e. _fpsDivider = 3, 60 (normal FPS) will be divided by 3
        imageOverlay._fpsDivider = 1;

        // Count frames
        imageOverlay._fpsCounter = 0;

        // Callback function
        imageOverlay._onPlayEndCallback = null;

        // Number - index of current working mask
        // null means - this value will change on next play
        imageOverlay._currentWorkingMaskIndex = null;

        // value between current and next playable frame
        imageOverlay._frameIndexStep = 1;

    };

    //////////////////////////////////////////////////
    // Updates
    //////////////////////////////////////////////////

    /**
     * Update canvas, should be call by ticker only
     * @private
     */
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

        if (imageOverlay.getIsActive()) {
            imageOverlay._updateMask();
        }

        renderer.render(container);

    };

    /**
     * Update canvas with any side effect
     * @private
     */
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

    /**
     * Add one mask to list of masks
     * @param {Array} pathToImageList - array of paths to images
     * @param options - see @constructor
     * @return {Promise}
     */
    ImageOverlay.prototype.addMask = function (pathToImageList, options) {

        var imageOverlay = this;

        options = options || {};

        options.flipX = (options.hasOwnProperty('flipX') && options.flipX !== null) ? options.flipX : !getRandomBetween(2);
        options.flipY = (options.hasOwnProperty('flipY') && options.flipY !== null) ? options.flipY : !getRandomBetween(2);
        options.isInvert = options.hasOwnProperty('isInvert') ? options.isInvert : false;

        var p = Promise.resolve(pathToImageList);

        if (options.isInvert) {
            p = p.then(function (pathToImageList) {
                return Promise.all(pathToImageList.map(ImageOverlay.utils.invertImage));
            });
        }

        return p.then(function (pathToImageList) {
            return Promise.all(pathToImageList.map(function (pathToImage) {
                return imageOverlay._initializeMaskSprite(pathToImage, options);
            }));
        }).then(function (masks) {
            imageOverlay._pushMask(masks);
            imageOverlay._silentUpdate();
        });

    };

    /**
     * Get mask's frame by alias
     * @param {String|Number} frameIndex - alias of mask's index
     * @return {Number}
     */
    ImageOverlay.prototype.parseBeginEndMaskIndex = function (frameIndex) {

        var imageOverlay = this;

        if (frameIndex === 'begin') { // 'begin'
            return 0;
        }

        if (frameIndex === 'end') { // or 'end'
            return imageOverlay.getMasks()[imageOverlay.getCurrentWorkingMaskIndex()].length - 1;
        }

        return frameIndex;

    };

    /**
     * @param {String|Number} frameIndex - start mask's index
     * @param {Number} frameIndexStep - step of increasing mask's index
     * @return {Promise} - resolve on end play
     */
    ImageOverlay.prototype.playMask = function (frameIndex, frameIndexStep) {

        var imageOverlay = this;

        var ticker = imageOverlay.getTicker();

        imageOverlay.defineCurrentWorkingMaskIndex();

        if (frameIndex === undefined || frameIndex === null) {
            frameIndex = imageOverlay.getFrameIndex();
        } else {
            frameIndex = imageOverlay.parseBeginEndMaskIndex(frameIndex);
        }

        if (frameIndexStep === undefined || frameIndexStep === null) {
            imageOverlay._setFrameIndexStep(1);
        } else {
            imageOverlay._setFrameIndexStep(frameIndexStep);
        }

        return new Promise(function (resolve, reject) {

            imageOverlay._resetFpsCounter();

            imageOverlay._setOnPlayEndCallback(resolve);

            imageOverlay._setIsActive(true);

            imageOverlay._setFrameIndex(frameIndex);

            ticker.start();

        });

    };

    /**
     * @param {Number} index
     */
    ImageOverlay.prototype.drawMaskIndex = function (index) {

        var imageOverlay = this;

        imageOverlay.defineCurrentWorkingMaskIndex();

        imageOverlay._setFrameIndex(index);

        imageOverlay._setFrameIndexStep(0);

        imageOverlay._updateMask();

        imageOverlay._silentUpdate();

    };

    /**
     * @param {String} pathToImage
     * @param {Object} options - see @constructor options.options
     * @return {Promise}
     * @private
     */
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

    /**
     * Redraw mask to draw opn canvas
     * @private
     */
    ImageOverlay.prototype._updateMask = function () {

        var imageOverlay = this;

        var currentWorkingMaskIndex = imageOverlay.getCurrentWorkingMaskIndex();

        var mask = imageOverlay.getMasks()[currentWorkingMaskIndex];
        var frameIndex = imageOverlay.getFrameIndex();

        var backgroundSprite = imageOverlay.getBackgroundSprite();
        var currentFrameIndex = frameIndex;
        var container = imageOverlay.getContainer();

        var frameIndexStep = imageOverlay._getFrameIndexStep();

        imageOverlay._cleanContainer();
        // imageOverlay._fitToRenderSize(backgroundSprite);
        container.addChild(backgroundSprite);

        console.log('update mask');

        // if (currentFrameIndex >= mask.length) {
        if (mask[currentFrameIndex]) {
            console.log('update frame');
            container.addChild(mask[currentFrameIndex]);
            imageOverlay._setFrameIndex(frameIndex + frameIndexStep);
        } else {
            console.log('stop');
            container.addChild(mask[currentFrameIndex - frameIndexStep]);
            imageOverlay._setIsActive(false);
            imageOverlay.getTicker().stop();
            imageOverlay._executePlayEndCallback();
        }

    };

    //////////////////////////////////////////////////
    // Ticker
    //////////////////////////////////////////////////

    /**
     * @private
     */
    ImageOverlay.prototype._initializeTicker = function () {

        var ticker = new PIXI.ticker.Ticker();
        var imageOverlay = this;

        ticker.autoStart = false;

        ticker.add(imageOverlay._update, imageOverlay);

        imageOverlay._setTicker(ticker);

    };

    /**
     * @private
     */
    ImageOverlay.prototype._destroyTicker = function () {

        var imageOverlay = this;

        var ticker = imageOverlay.getTicker();

        ticker.remove(imageOverlay._update, imageOverlay);
        ticker.stop();

    };

    //////////////////////////////////////////////////
    // Sprite initializing
    //////////////////////////////////////////////////

    /**
     * Create and define texture from image
     * @param {String} pathToImage
     * @return {Promise}
     */
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

    /**
     * @param {String} pathToImage
     * @return {Promise}
     */
    ImageOverlay.prototype.initializeBackgroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage)
            .then(function (sprite) {
                imageOverlay.addSprite(sprite, BACKGROUND_IMAGE_INDEX);
                imageOverlay._fitToRenderSize(sprite);
                imageOverlay._setBackgroundSprite(sprite);
            });

    };

    /**
     * @param {String} pathToImage
     * @return {Promise}
     */
    ImageOverlay.prototype.initializeForegroundImage = function (pathToImage) {

        var imageOverlay = this;

        return this.initializeImage(pathToImage)
            .then(function (sprite) {
                imageOverlay.setRenderSize(sprite.width, sprite.height);
                imageOverlay.addSprite(sprite, FOREGROUND_IMAGE_INDEX);

                var backgroundSprite = imageOverlay.getBackgroundSprite();

                if (backgroundSprite) {
                    imageOverlay._fitToRenderSize(backgroundSprite);
                }

                imageOverlay._setForegroundSprite(sprite);

            });

    };


    //////////////////////////////////////////////////
    // Render
    //////////////////////////////////////////////////

    /**
     * @param {Number} width - new renderer width
     * @param {Number} height - new renderer height
     */
    ImageOverlay.prototype.setRenderSize = function (width, height) {

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();

        renderer.resize(width, height);

    };

    /**
     * Add new sprite to container
     * @param {PIXI.Sprite} sprite
     * @param {Number} zIndex
     */
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

    /**
     * Remove all sprites from container
     * @private
     */
    ImageOverlay.prototype._cleanContainer = function () {

        var imageOverlay = this;
        var container = imageOverlay.getContainer();

        while (container.children.length > 0) {
            container.removeChild(container.getChildAt(0));
        }

    };

    /**
     * Resize sprite to render size
     * @param {PIXI.Sprite} sprite
     * @private
     */
    ImageOverlay.prototype._fitToRenderSize = function (sprite) {

        var imageOverlay = this;
        var renderer = imageOverlay.getRenderer();

        sprite.width = renderer.width;
        sprite.height = renderer.height;

    };

    //////////////////////////////////////////////////
    // Events
    //////////////////////////////////////////////////

    /**
     * @private
     */
    ImageOverlay.prototype._executePlayEndCallback = function () {

        var imageOverlay = this;
        var onPlayEndCallback = imageOverlay._getOnPlayEndCallback();

        if (onPlayEndCallback) {
            imageOverlay._setOnPlayEndCallback(null);
            return onPlayEndCallback();
        }

    };

    //////////////////////////////////////////////////
    // Getters / Setters
    //////////////////////////////////////////////////

    // only GET
    /**
     * @return {HTMLElement} - canvas
     */
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

    /**
     * Define index of working mask
     */
    ImageOverlay.prototype.defineCurrentWorkingMaskIndex = function () {

        var imageOverlay = this;

        var masks = imageOverlay.getMasks();

        var currentWorkingMaskIndex = imageOverlay.getCurrentWorkingMaskIndex();

        if (currentWorkingMaskIndex === null) {
            imageOverlay._setCurrentWorkingMaskIndex(getRandomBetween(masks.length));
        }

    };

    /**
     * If _currentWorkingMaskIndex === null, _currentWorkingMaskIndex will defined on next play
     */
    ImageOverlay.prototype.undefineCurrentWorkingMaskIndex = function () {
        this._setCurrentWorkingMaskIndex(null);
    };

    ImageOverlay.prototype._setCurrentWorkingMaskIndex = function (index) {
        return this._currentWorkingMaskIndex = index;
    };

    ImageOverlay.prototype.getCurrentWorkingMaskIndex = function () {
        return this._currentWorkingMaskIndex;
    };

    ImageOverlay.prototype.getMasks = function () {
        return this._masks;
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

    ImageOverlay.prototype._getFrameIndexStep = function () {
        return this._frameIndexStep;
    };

    ImageOverlay.prototype._setFrameIndexStep = function (frameIndexStep) {
        return this._frameIndexStep = frameIndexStep;
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

    ImageOverlay.prototype._resetFpsCounter = function () {
        return this._fpsCounter = 0;
    };


    ImageOverlay.prototype._getOnPlayEndCallback = function () {
        return this._onPlayEndCallback;
    };

    ImageOverlay.prototype._setOnPlayEndCallback = function (onPlayEndCallback) {
        return this._onPlayEndCallback = onPlayEndCallback;
    };


    //////////////////////////////////////////////////
    // Helper
    //////////////////////////////////////////////////

    /**
     * Random from range [start, stop)
     * @param {Number} start
     * @param {Number} stop
     * @return {number}
     */
    function getRandomBetween(start, stop) {

        if (arguments.length === 1) {
            stop = start;
            start = 0;
        }

        return Math.floor(Math.random() * (stop - start) + start);

    }

    ImageOverlay.utils = {

        /**
         * Create 1x1 pixel
         * @param color
         * @param opacity
         * @return {String} - base64
         */
        createPixel: function createPixel(color, opacity) {

            var svgSrc = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1px" height="1px" viewBox="0 0 1 1" ><rect {{attr}} x="0" y="0" width="1" height="1"/></svg>';

            var attr;

            if (color === undefined || color === null) {
                color = '#000000';
            }

            if (opacity === undefined || opacity === null) {
                opacity = '1';
            }

            attr = 'fill="' + color + '" fill-opacity="' + opacity + '"';

            svgSrc = svgSrc.replace('{{attr}}', attr);

            return 'data:image/svg+xml;base64,' + window.btoa(svgSrc);

        },

        /**
         * @param imagePath
         * @return {Promise}
         */
        loadImage: function (imagePath) {

            return new Promise(function (resolve, reject) {

                var image = new Image();

                function onImageLoad() {
                    image.removeEventListener('load', onImageLoad, false);
                    image.removeEventListener('error', onImageError, false);
                    resolve(image);
                }

                function onImageError() {
                    image.removeEventListener('load', onImageLoad, false);
                    image.removeEventListener('error', onImageError, false);
                    reject();
                }

                image.addEventListener('load', onImageLoad, false);
                image.addEventListener('error', onImageError, false);

                image.src = imagePath;

            });

        },

        /**
         * Create new image with inverted RGB only, not Alpha
         * @param imagePath
         * @return {String} - base64
         */
        invertImage: function (imagePath) {

            return ImageOverlay.utils.loadImage(imagePath).then(function (image) {

                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;

                var context = canvas.getContext('2d');

                context.drawImage(image, 0, 0);

                var imageData = context.getImageData(0, 0, image.width, image.height);
                var data = imageData.data;

                for (var i = 0, len = data.length; i < len; i += 4) {
                    // red
                    data[i] = 255 - data[i];
                    // green
                    data[i + 1] = 255 - data[i + 1];
                    // blue
                    data[i + 2] = 255 - data[i + 2];
                    // alpha
                    // data[i + 3] = 255 - data[i + 3];
                }

                // overwrite original image
                context.putImageData(imageData, 0, 0);

                return canvas.toDataURL();

            });

        }

    };

}(window));
