document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const leftBtn = document.getElementById('leftBtn');
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const rightBtn = document.getElementById('rightBtn');
    const spaceBtn = document.getElementById('spaceBtn');

    canvas.width = 800;
    canvas.height = 600;

    let gameOver = false;
    let won = false;

    let orbImage = new Image();
    orbImage.src = 'A.jpg';

    let playerImage = new Image();
    playerImage.src = 'B.jpg';

    let fedImage = new Image();
    fedImage.src = 'Fed.jpg';

    let polImage = new Image();
    polImage.src = 'Pol.jpg';

    let player = {
        x: 10,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 10,
        draw() {
            ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
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
                ctx.drawImage(orbImage, this.x, this.y, this.size, this.size);
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

            // Draw the background images
            ctx.drawImage(fedImage, 0, canvas.height - fedImage.height);
            ctx.drawImage(polImage, canvas.width - polImage.width, 0);

            player.draw();
            sword.draw();
            balls.forEach(ball => {
                ball.x += ball.dx;
                ball.y += ball.dy;
                if (ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
                if (ball.y < 0 || ball.y > canvas.height) ball.dy *= -1;
                ball.draw();

                if (sword.swinging &&
                    ball.x < sword.x + sword.width &&
                    ball.x + ball.size > sword.x &&
                    ball.y < sword.y + sword.height &&
                    ball.y + ball.size > sword.y) {
                    balls = balls.filter(b => b !== ball);
                }

                if (checkCollision(player, ball)) {
                    gameOver = true;
                }
            });

            if (player.x + player.width >= canvas.width && player.y <= 0) {
                won = true;
                gameOver = true;
            }

            if (balls.length === 0 && !gameOver) {
                ctx.font = '30px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText('ALL THE JOURNOS ARE GONE', 200, 300);
            }

            requestAnimationFrame(updateGame);
        } else {
            if (won) {
                ctx.font = '40px Arial';
                ctx.fillStyle = 'green';
                ctx.fillText('Safety at the station!', 250, 300);
            } else {
                ctx.font = '40px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText('DARN JOURNALISTS!', 250, 300);
            }
        }
    }

    function handleKeyDown(e) {
        if (!gameOver) {
            switch (e.keyCode) {
                case 37: // left arrow
                    player.x = Math.max(player.x - player.speed, 0);
                    break;
                case 38: // up arrow
                    player.y = Math.max(player.y - player.speed, 0);
                    break;
                case 39: // right arrow
                    player.x = Math.min(player.x + player.speed, canvas.width - player.width);
                    break;
                case 40: // down arrow
                    player.y = Math.min(player.y + player.speed, canvas.height - player.height);
                    break;
                case 32: // space bar
                    sword.swinging = true;
                    setTimeout(() => sword.swinging = false, 300);
                    break;
            }
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
