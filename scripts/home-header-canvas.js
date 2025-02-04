window.addEventListener("load", function () {

    // Setup the canvas
    let canvas = document.getElementById("header-canvas");
    let ctx = canvas.getContext("2d");
    let header_container = document.querySelector(".header");
    canvas.width = header_container.offsetWidth;
    canvas.height = header_container.offsetHeight;


    // Track mouse coordinates. These are relative to the canvas.
    let mouse = { x: 0, y: 0 }
    document.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX - canvas.offsetLeft;
        mouse.y = e.clientY - canvas.offsetTop;
    })

    // Setup the basic drawing and animation.
    let dt = 0; // Delta time
    let lastTime = 0; // Used to calculate delta time.
    function update() {
        dt = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();


        requestAnimationFrame(update);
    }
    update();
})

