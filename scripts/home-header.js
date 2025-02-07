import HeaderThreeJS from "./setup-header-threejs.js";


window.addEventListener("load", () => {
    const headerThreeJS = new HeaderThreeJS();    

    // Track mouse position
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener("mousemove", (e) => {
        mouse = { x: e.clientX, y: e.clientY }; 
    })

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

        headerThreeJS.update(mouse.x, mouse.y, dt);

        requestAnimationFrame(update);
    }

    update();
});
