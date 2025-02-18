import Node from "./Node.js";

const GRID = {
    CELL_SIZE: 100
}
const DOT_SIZE = 2;
const NODE_COUNT = 100;

window.addEventListener("load", () => {
    const header = document.querySelector(".header");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    function setCanvasSize() {
        canvas.width = header.offsetWidth;
        canvas.height = header.offsetHeight;
    }
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class NodeWeb {
        constructor() {
            this.nodes = [];
            this.dt = 0;
            this.lastTime = 0;
            this._initCanvas();
            this._generateNodes();

            window.addEventListener("resize", this._resizeCanvas.bind(this));

            setInterval(this.update.bind(this), 1000 / 60);
        }

        _initCanvas() {
            this.canvas = canvas;
            this.ctx = ctx;
            this._resizeCanvas()
        }

        _generateNodes() {
            for (let i = 0; i < NODE_COUNT; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.nodes.push(new Node(x, y));
            }
        }

        _resizeCanvas() {
            const header = document.querySelector(".header");
            this.canvas.width = header.offsetWidth;
            this.canvas.height = header.offsetHeight;
        }

        update() {
            this.dt = (Date.now() - this.lastTime) / 1000;
            this.lastTime = Date.now();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].update(this.dt);
                this.nodes[i].draw(this.ctx);
            }
        }
    }

    new NodeWeb();
});
