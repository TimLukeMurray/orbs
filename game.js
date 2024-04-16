document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    let gameOver = false; // New variable to control game state

    let player = {
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        speed: 10,
        draw() {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    let sword = {
        x: player.x,
        y: player.y,
        width: 200,
        height: 10,
        swinging: false,
        draw() {
            if (this.swinging) {
                ctx.fillStyle = 'grey';
                ctx.fillRect(this.x, this.y - 5, this.width, this.height);
            }
        }
    };

    let balls = [];
    function createBall() {
        let size = 20;
        balls.push({
            x: Math.random() * (canvas.width - size),
            y: Math.random() * (canvas.height - size),
            size: size,
            dx: (Math.random() * 2 - 1) * 4,
            dy: (Math.random() * 2 - 1) * 4,
            draw() {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function checkCollision(player, ball) {
        return ball.x < player.x + player.width &&
               ball.x + ball.size > player.x &&
               ball.y < player.y + player.height &&
               ball.y + ball.size > player.y;
    }

    function updateGame() {
        if (!gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            player.draw();
            sword.draw();
            balls.forEach(ball => {
                ball.x += ball.dx;
                ball.y += ball.dy;

                if (ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
                if (ball.y < 0 || ball.y > canvas.height) ball.dy *= -1;

                ball.draw();

                // Check collision with sword
                if (sword.swinging &&
                    ball.x < sword.x + sword.width &&
                    ball.x + ball.size > sword.x &&
                    ball.y < sword.y + sword.height &&
                    ball.y + ball.size > sword.y) {
                    balls = balls.filter(b => b !== ball);
                }

                // Check collision with player
                if (checkCollision(player, ball)) {
                    gameOver = true;
                }
            });

            if (balls.length === 0 && !gameOver) {
                ctx.font = '30px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText('ALL THE ORBS ARE DESTROYED', 200, 300);
            }

            requestAnimationFrame(updateGame);
        } else {
            ctx.font = '40px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText('AN ORB GOT YOU', 250, 300);
        }
    }

    function handleKeyDown(e) {
        if (!gameOver) {
            switch (e.keyCode) {
                case 37: // left arrow
                    player.x -= player.speed;
                    break;
                case 38: // up arrow
                    player.y -= player.speed;
                    break;
                case 39: // right arrow
                    player.x += player.speed;
                    break;
                case 40: // down arrow
                    player.y += player.speed;
                    break;
                case 32: // space bar
                    sword.swinging = true;
                    setTimeout(() => sword.swinging = false, 300);
                    break;
            }

            // Update sword position
            sword.x = player.x + player.width / 2;
            sword.y = player.y;
        }
    }

    document.addEventListener('keydown', handleKeyDown);

    for (let i = 0; i < 5; i++) {
        createBall();
    }

    updateGame();
});
