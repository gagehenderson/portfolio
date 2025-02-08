
const GRID = {
    CELL_SIZE: 100
}
const DOT_SIZE = 2;
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
            this._initCanvas();

            window.addEventListener("resize", this._resizeCanvas.bind(this));
        }

        _initCanvas() {
            this.canvas = canvas;
            this.ctx = ctx;
            this._resizeCanvas()
        }

        _resizeCanvas() {
            const header = document.querySelector(".header");
            this.canvas.width = header.offsetWidth;
            this.canvas.height = header.offsetHeight;
        }
    }

    new NodeWeb();
});
