const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let balls = [];
let animationFrameId = null;

function generateBallInputs() {
    const numBalls = parseInt(document.getElementById('numBalls').value);
    const ballInputs = document.getElementById('ballInputs');
    ballInputs.innerHTML = ''; // Clear existing inputs

    for (let i = 0; i < numBalls; i++) {
        const randomX = (Math.random() * 0.8 + 0.1).toFixed(2);
        const randomY = (Math.random() * 0.8 + 0.1).toFixed(2);
        const html = `<div class="ball-inputs">
            <label>Ball ${i+1}:</label>
            <input type="number" id="x${i}" placeholder="Start X" value="${randomX}">
            <input type="number" id="y${i}" placeholder="Start Y" value="${randomY}">
            <input type="number" id="angle${i}" placeholder="Angle" value="${Math.floor(Math.random() * 360)}">
            <input type="number" id="velocity${i}" placeholder="Velocity" value="0">
            <input type="number" id="mass${i}" placeholder="Mass" value="10">
            <input type="number" id="radius${i}" placeholder="Radius" value="10">
        </div>`;
        ballInputs.insertAdjacentHTML('beforeend', html);
    }
}

function startSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    const G = parseFloat(document.getElementById('gravitationalConstant').value);
    const elasticity = parseFloat(document.getElementById('elasticity').value);
    balls = [];
    const numBalls = parseInt(document.getElementById('numBalls').value);

    for (let i = 0; i < numBalls; i++) {
        balls.push(createBall(i));
    }

    function draw() {
        updateCanvas(G, elasticity, draw);
    }

    animationFrameId = requestAnimationFrame(draw);
}

function createBall(index) {
    const x = parseFloat(document.getElementById(`x${index}`).value) * canvas.width;
    const y = parseFloat(document.getElementById(`y${index}`).value) * canvas.height;
    const angle = parseFloat(document.getElementById(`angle${index}`).value);
    const velocity = parseFloat(document.getElementById(`velocity${index}`).value);
    const mass = parseFloat(document.getElementById(`mass${index}`).value);
    const radius = parseFloat(document.getElementById(`radius${index}`).value);
    // const color = `hsl(${360 * Math.random()}, 100%, 50%)`; // Random color for each ball
    const color = 'red';

    return {
        x, y,
        vx: velocity * Math.cos(angle * Math.PI / 180),
        vy: velocity * Math.sin(angle * Math.PI / 180),
        mass, radius, color
    };
}

function updateCanvas(G, elasticity, draw) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach((ball, index) => {
        // Gravitational forces
        balls.forEach(other => {
            if (ball !== other) {
                const dx = other.x - ball.x;
                const dy = other.y - ball.y;
                const distSquared = dx * dx + dy * dy;
                const dist = Math.sqrt(distSquared);
                const force = G * ball.mass * other.mass / distSquared;
                const ax = force * dx / dist / ball.mass;
                const ay = force * dy / dist / ball.mass;
                ball.vx += ax;
                ball.vy += ay;
            }
        });

        // Update positions and resolve collisions
        ball.x += ball.vx;
        ball.y += ball.vy;
    });

    // Handle collisions
    balls.forEach((ball, index) => {
        for (let i = index + 1; i < balls.length; i++) {
            let other = balls[i];
            let dx = other.x - ball.x;
            let dy = other.y - ball.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < ball.radius + other.radius) {
                resolveCollision(ball, other, elasticity);
                adjustPositions(ball, other);
            }
        }

        // Boundary checks
        if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) {
            ball.vx = -ball.vx;
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }
        if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
            ball.vy = -ball.vy;
            ball.y = ball.y < ball.radius ? ball.radius : canvas.height - ball.radius;
        }

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = ball.color;
        ctx.fill();
    });

    animationFrameId = requestAnimationFrame(draw);
}

function resolveCollision(ball1, ball2, elasticity) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const collisionAngle = Math.atan2(dy, dx);

    const speed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
    const speed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);

    const direction1 = Math.atan2(ball1.vy, ball1.vx);
    const direction2 = Math.atan2(ball2.vy, ball2.vx);

    const velocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
    const velocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
    const velocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
    const velocityY2 = speed2 * Math.sin(direction2 - collisionAngle);

    // Compute the final velocities incorporating elasticity
    const finalVelocityX1 = elasticity * ((ball1.mass - ball2.mass) * velocityX1 + 2 * ball2.mass * velocityX2) / (ball1.mass + ball2.mass);
    const finalVelocityX2 = elasticity * ((ball2.mass - ball1.mass) * velocityX2 + 2 * ball1.mass * velocityX1) / (ball1.mass + ball2.mass);

    ball1.vx = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI / 2) * velocityY1;
    ball1.vy = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI / 2) * velocityY1;
    ball2.vx = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI / 2) * velocityY2;
    ball2.vy = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI / 2) * velocityY2;
}

function adjustPositions(ball1, ball2) {
    const overlap = ball1.radius + ball2.radius - Math.sqrt((ball1.x - ball2.x) ** 2 + (ball1.y - ball2.y) ** 2);
    const angle = Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

    // Push both balls away from each other to avoid overlap
    ball1.x -= overlap * Math.cos(angle) / 2;
    ball1.y -= overlap * Math.sin(angle) / 2;
    ball2.x += overlap * Math.cos(angle) / 2;
    ball2.y += overlap * Math.sin(angle) / 2;
}

document.addEventListener('DOMContentLoaded', generateBallInputs); // Generate initial input fields on page load
