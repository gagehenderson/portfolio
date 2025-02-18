// Not the runtime. A node in the web.

const SIZE = 1;

export default class Node {
    constructor(x, y) {
        this.anchor_position = { x: x, y: y };
        this.position = { x: 0, y: 0 };
        this.size     = SIZE;
        this.color    = "255,255,255"; // rgb
        this.alpha    = 1;
    }

    update(dt) {
        // Calculate our position.
        this.position.x = this.anchor_position.x;
        this.position.y = this.anchor_position.y;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(" + this.color + "," + this.alpha + ")";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}
