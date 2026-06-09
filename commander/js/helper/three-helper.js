class ThreeHelper {
    constructor() {
    }

    left(step) {
        movePin(-step, 0, 0);
    }

    right(step) {
        movePin(step, 0, 0);
    }

    up(step) {
        movePin(0, step, 0);
    }

    down(step) {
        movePin(0, -step, 0);
    }

    forward(step) {
        movePin(0, 0, -step);
    }

    back(step) {
        movePin(0, 0, step);
    }

    setColor(r, g, b) {
        setPinColor(r, g, b)
    }
}

threeHelper = new ThreeHelper();