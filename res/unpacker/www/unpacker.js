(function () {

    // var jsonList = ['fading/sprites-0.json', 'fading/sprites-1.json', 'fading/sprites-2.json'];


    // loadAssets(jsonList).then(function () {
    loadAssets(['fading/fade.json']).then(function () {

        var fileList = [],
            i;

        // for (i = 0; i < 16; i += 1) {
        //     fileList.push('switch-page-28-frames-000' + (i < 10 ? '0' : '') + i + '.png');
        // }
        for (i = 0; i < 16; i += 1) {
            fileList.push('fade-1st-' + (i < 10 ? '0' : '') + i + '.png');
        }

        //
        // for (i = 0; i < 32; i += 1) {
        //     fileList.push('switch-page-32-frames-000' + (i < 10 ? '0' : '') + i + '.png');
        // }


        var p = Promise.resolve();

        fileList.forEach(function (fileName) {
            p = p.then(function () {
                return saveFile(fileName);
            });
        });

        p.then(function () {
            console.log('done')
        });

    });

    function saveFile(fileName) {

        return new Promise(function (resolve, reject) {

            var container = new PIXI.Container();
            var renderer = PIXI.autoDetectRenderer(600, 338, null, true);

            container.addChild(PIXI.Sprite.fromFrame(fileName));

            renderer.render(container);

            document.body.appendChild(renderer.view);

            setTimeout(function () {

                var a = document.createElement('a');

                a.href = renderer.view.toDataURL();
                a.innerHTML = fileName;
                a.download = fileName;

                document.body.appendChild(a);


                setTimeout(function () {

                    a.click();

                    renderer.view.parentNode.removeChild(renderer.view);
                    a.parentNode.removeChild(a);

                    setTimeout(resolve, 1000);

                }, 1000);

            }, 500);




















        });

    }



    function loadAssets (jsonsList) {

        return new Promise(function (resolve, reject) {

            var loader = new PIXI.loaders.Loader();

            loader.add(jsonsList);

            loader.on('error', reject);

            loader.load(resolve);

        });

    }


}());