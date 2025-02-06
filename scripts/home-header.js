import HeaderThreeJS from "./setup-header-threejs.js";

// Tweakable constants, have some fun :)

window.addEventListener("load", () => {
    const headerThreeJS = new HeaderThreeJS();    

    // Handle resizing.
    window.addEventListener("resize", () => {
        headerThreeJS.onResize();
    });

    // Movement, animation, etc,
    let dt = 0;
    let lastTime = Date.now();
    function update() {
        const dt = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();

        headerThreeJS.update(dt);

        requestAnimationFrame(update);
    }

    update();
});
