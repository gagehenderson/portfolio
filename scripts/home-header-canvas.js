window.addEventListener("load", function () {
    // Constants, tweak these for fun results :)
    const BLUR_AMOUNT   = 0;
    const HUE_ROT_SPEED = 50;
    const DIM_ALPHA     = 0.001;
    const BALL_COUNT    = 10;
    const BALL_SIZE     = 5;
    const BALL_SPEED    = 50;

    // Setup the canvas
    let canvas = document.getElementById("header-canvas");
    let ctx = canvas.getContext("2d");
    function setCanvasSize() {
        let header_container = document.querySelector(".header");
        canvas.width = header_container.offsetWidth;
        canvas.height = header_container.offsetHeight;
    }
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Set black background
    ctx.fillStyle = `rgba(0, 0, 0)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Track mouse coordinates. These are relative to the canvas.
    let mouse = { x: 0, y: 0 }
    document.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX - canvas.offsetLeft;
        mouse.y = e.clientY - canvas.offsetTop;
    })

    // Balls!
    let balls = [];
    for (let i=0;i<=BALL_COUNT;i++) {
        balls.push({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            radius: BALL_SIZE,
            direction: Math.random() * Math.PI * 2,
            hue: Math.random() * 360
        })
    }

    // Setup the loop
    let dt = 0; // Delta time
    let lastTime = Date.now();
    function update() {
        dt = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();

        // Update balls.
        for (let i=0;i<balls.length;i++) {
            let ball = balls[i];

            ball.position.x += Math.cos(ball.direction) * BALL_SPEED * dt;
            ball.position.y += Math.sin(ball.direction) * BALL_SPEED * dt;

            ball.hue += HUE_ROT_SPEED * dt;
            ball.hue %= 360;

            if (ball.position.x - ball.radius <= 0) {
                ball.position.x = ball.radius;
                ball.direction = Math.PI - ball.direction;
            } else if (ball.position.x + ball.radius >= canvas.width) {
                ball.position.x = canvas.width - ball.radius;
                ball.direction = Math.PI - ball.direction;
            }
            if (ball.position.y - ball.radius <= 0) {
                ball.position.y = ball.radius;
                ball.direction = -ball.direction;
            } else if (ball.position.y + ball.radius >= canvas.height) {
                ball.position.y = canvas.height - ball.radius;
                ball.direction = -ball.direction;
            }

            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(ball.hue)}, 100%, 50%, 1)`;
            ctx.filter = `blur(${BLUR_AMOUNT}px)`;
            ctx.fill();
        }

        requestAnimationFrame(update);
    }
    update();
})

