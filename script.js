const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
const circles = [];
let selectedCircle = null;
let dragStartX = 0;
let dragStartY = 0;
let G = parseFloat(document.getElementById('gravConst').value); // Gravitational constant

class Circle {
    constructor(x, y, radius, mass, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.dx = 0;
        this.dy = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        if (!selectedCircle || this !== selectedCircle) {
            this.applyGravity();
            this.x += this.dx;
            this.y += this.dy;

            // Wall collisions
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx;
                this.x = Math.min(Math.max(this.x, this.radius), canvas.width - this.radius);
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy;
                this.y = Math.min(Math.max(this.y, this.radius), canvas.height - this.radius);
            }
        }
    }

    applyGravity() {
        circles.forEach(circle => {
            if (circle !== this) {
                const dx = circle.x - this.x;
                const dy = circle.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = G * this.mass * circle.mass / (distance * distance);
                const acceleration = force / this.mass;
                this.dx += acceleration * dx / distance;
                this.dy += acceleration * dy / distance;
            }
        });
    }

    isInside(x, y) {
        return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) < this.radius;
    }
}

function initializeCircles() {
    circles.splice(0, circles.length); // Clear existing circles
    for (let i = 1; i <= 4; i++) {
        const radius = parseInt(document.getElementById(`radius${i}`).value);
        const mass = parseInt(document.getElementById(`mass${i}`).value);
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const color = `hsl(${i * 90}, 100%, 50%)`;
        circles.push(new Circle(x, y, radius, mass, color));
    }
}

function updateCircleProperties() {
    G = parseFloat(document.getElementById('gravConst').value);
    for (let i = 0; i < circles.length; i++) {
        const radius = parseInt(document.getElementById(`radius${i+1}`).value);
        const mass = parseInt(document.getElementById(`mass${i+1}`).value);
        circles[i].radius = radius;
        circles[i].mass = mass;
    }
}

function updateSimulation() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
        circle.update();
        circle.draw();
    });
    handleCollisions();
    requestAnimationFrame(updateSimulation);
}

function handleCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let circle1 = circles[i];
            let circle2 = circles[j];
            let dx = circle1.x - circle2.x;
            let dy = circle1.y - circle2.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < circle1.radius + circle2.radius) {
                // Elastic collision logic
                let angle = Math.atan2(dy, dx);
                let sin = Math.sin(angle);
                let cos = Math.cos(angle);

                // Rotate circle1's velocity
                let v1x = circle1.dx * cos + circle1.dy * sin;
                let v1y = circle1.dy * cos - circle1.dx * sin;

                // Rotate circle2's velocity
                let v2x = circle2.dx * cos + circle2.dy * sin;
                let v2y = circle2.dy * cos - circle2.dx * sin;

                // Conservation of momentum
                let v1fx = ((circle1.mass - circle2.mass) * v1x + 2 * circle2.mass * v2x) / (circle1.mass + circle2.mass);
                let v2fx = ((circle2.mass - circle1.mass) * v2x + 2 * circle1.mass * v1x) / (circle1.mass + circle2.mass);

                // Update velocities
                circle1.dx = v1fx * cos - v1y * sin;
                circle1.dy = v1y * cos + v1fx * sin;
                circle2.dx = v2fx * cos - v2y * sin;
                circle2.dy = v2y * cos + v2fx * sin;

                // Separate circles to avoid overlapping
                let overlap = 0.5 * (circle1.radius + circle2.radius - distance + 1);
                circle1.x += overlap * cos;
                circle1.y += overlap * sin;
                circle2.x -= overlap * cos;
                circle2.y -= overlap * sin;
            }
        }
    }
}

canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragStartX = x;
    dragStartY = y;
    circles.forEach(circle => {
        if (circle.isInside(x, y)) {
            selectedCircle = circle;
            circle.dx = 0;
            circle.dy = 0;
        }
    });
});

canvas.addEventListener('mousemove', function(e) {
    if (selectedCircle) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        selectedCircle.x = x;
        selectedCircle.y = y;
    }
});

canvas.addEventListener('mouseup', function(e) {
    if (selectedCircle) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        selectedCircle.dx = (x - dragStartX) * 0.1;
        selectedCircle.dy = (y - dragStartY) * 0.1;
        selectedCircle = null;
    }
});

initializeCircles();
updateSimulation();
