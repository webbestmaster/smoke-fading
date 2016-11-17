# [Smoke-Fading](https://github.com/webbestmaster/smoke-fading#readme) *0.1.0*

> PIXI fading plugin


### www/js/our-plugin/smoke-fading.js


#### ImageOverlay([options]) 






##### Parameters

- **options** `Object`  *Optional* - options for constructor
- **options.bg** `String`  *Optional* - path to background image, you can use .initializeBackgroundImage()
- **options.fg** `String`   - path to foreground image, you can use .initializeForegroundImage()
- **options.masks** `Array.&lt;Array&gt;`  *Optional* - array of masks, you can use .addMask()
- **options.masksi** `Array.&lt;Array&gt;`  *Optional* - one mask
- **options.masksij** `String`  *Optional* - path to one mask image
- **options.options** `Object`  *Optional* - options of masks, you can use .addMask() with options
- **options.options.flipX&#x3D;true|false-will** `Boolean`  *Optional* be get random] - need to flip by X axis
- **options.options.flipY&#x3D;true|false-will** `Boolean`  *Optional* be get random] - need to flip by Y axis
- **options.options.isInvert&#x3D;false** `Boolean`  *Optional* - need to invert white/black of mask
- **options.success** `Function`  *Optional* - callback on success
- **options.error** `Function`  *Optional* - callback on error




##### Returns


- `Void`



#### ImageOverlay._parseOptions(options)  *private method*






##### Parameters

- **options**   - see @constructor




##### Returns


- `Void`



#### ImageOverlay._defineDefaultProperties()  *private method*








##### Returns


- `Void`



#### ImageOverlay.destroy() 

Destroy object






##### Returns


- `Void`



#### ImageOverlay._update()  *private method*

Update canvas, should be call by ticker only






##### Returns


- `Void`



#### ImageOverlay._silentUpdate()  *private method*

Update canvas with any side effect






##### Returns


- `Void`



#### ImageOverlay.addMask(pathToImageList, options) 

Add one mask to list of masks




##### Parameters

- **pathToImageList** `Array`   - array of paths to images
- **options**   - see @constructor




##### Returns


- `Promise`   



#### ImageOverlay.parseBeginEndMaskIndex(frameIndex) 

Get mask's frame by alias




##### Parameters

- **frameIndex** `String` `Number`   - alias of mask's index




##### Returns


- `Number`   



#### ImageOverlay.playMask(frameIndex, frameIndexStep) 






##### Parameters

- **frameIndex** `String` `Number`   - start mask's index
- **frameIndexStep** `Number`   - step of increasing mask's index




##### Returns


- `Promise`   - resolve on end play



#### ImageOverlay.drawMaskIndex(index) 






##### Parameters

- **index** `Number`   




##### Returns


- `Void`



#### ImageOverlay._initializeMaskSprite(pathToImage, options)  *private method*






##### Parameters

- **pathToImage** `String`   
- **options** `Object`   - see @constructor options.options




##### Returns


- `Promise`   



#### ImageOverlay._updateMask()  *private method*

Redraw mask to draw opn canvas






##### Returns


- `Void`



#### ImageOverlay._initializeTicker()  *private method*








##### Returns


- `Void`



#### ImageOverlay._destroyTicker()  *private method*








##### Returns


- `Void`



#### ImageOverlay.initializeImage(pathToImage) 

Create and define texture from image




##### Parameters

- **pathToImage** `String`   




##### Returns


- `Promise`   



#### ImageOverlay.initializeBackgroundImage(pathToImage) 






##### Parameters

- **pathToImage** `String`   




##### Returns


- `Promise`   



#### ImageOverlay.initializeForegroundImage(pathToImage) 






##### Parameters

- **pathToImage** `String`   




##### Returns


- `Promise`   



#### ImageOverlay.setRenderSize(width, height) 






##### Parameters

- **width** `Number`   - new renderer width
- **height** `Number`   - new renderer height




##### Returns


- `Void`



#### ImageOverlay.addSprite(sprite, zIndex) 

Add new sprite to container




##### Parameters

- **sprite** `PIXI.Sprite`   
- **zIndex** `Number`   




##### Returns


- `Void`



#### ImageOverlay._cleanContainer()  *private method*

Remove all sprites from container






##### Returns


- `Void`



#### ImageOverlay._fitToRenderSize(sprite)  *private method*

Resize sprite to render size




##### Parameters

- **sprite** `PIXI.Sprite`   




##### Returns


- `Void`



#### ImageOverlay._executePlayEndCallback()  *private method*








##### Returns


- `Void`



#### ImageOverlay.getCanvas() 








##### Returns


- `HTMLElement`   - canvas



#### ImageOverlay.defineCurrentWorkingMaskIndex() 

Define index of working mask






##### Returns


- `Void`



#### ImageOverlay.undefineCurrentWorkingMaskIndex() 

If _currentWorkingMaskIndex === null, _currentWorkingMaskIndex will defined on next play






##### Returns


- `Void`



#### getRandomBetween(start, stop) 

Random from range [start, stop)




##### Parameters

- **start** `Number`   
- **stop** `Number`   




##### Returns


- `number`   



#### createPixel(color, opacity) 

Create 1x1 pixel




##### Parameters

- **color**   
- **opacity**   




##### Returns


- `String`   - base64



#### loadImage(imagePath) 






##### Parameters

- **imagePath**   




##### Returns


- `Promise`   



#### invertImage(imagePath) 

Create new image with inverted RGB only, not Alpha




##### Parameters

- **imagePath**   




##### Returns


- `String`   - base64




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
