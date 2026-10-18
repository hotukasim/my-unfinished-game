
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    let x = 100;
    let y = 0;

    const size = 40;
    const speed = 3;

    let cameraX = 0;
    let vy = 0;

    const gravity = 0.5;
    const jumpStrength = -10;
    const groundHeight = 40;
    const groundY = canvas.height - groundHeight - size;

    let onGround = true;

    let score = 0;
    let playerHealth = 3;
    let gameOver = false;

    const keys = {};

    const bullets = [];
    const bulletSpeed = 7;

    let shootCooldown = 0;
    const shootDelay = 12;

    const enemies = [];

    const platforms = [
    {
        x: 300,
        y: 330,
        width: 150,
        height: 20
    }
    ];

    function spawnEnemy() {
    enemies.push({
        x: cameraX + canvas.width,
        y: groundY,
        size: 40,
        health: 1,
        speed: 1
    });
    }

    function resetEnemy() {
    enemies.push({
        x: 600,
        y: groundY,
        size: 40,
        health: 1,
        speed: 1
    });
    }

    function resetGame() {
    x = 100;
    y = groundY;
    cameraX = 0;
    vy = 0;
    onGround = true;

    score = 0;
    playerHealth = 3;
    gameOver = false;
    shootCooldown = 0;

    bullets.length = 0;
    enemies.length = 0;

    for (let key in keys) {
        keys[key] = false;
    }

    resetEnemy();
    }

    resetGame();

    document.addEventListener("keydown", function(event) {
    if (
        event.code === "Space" ||
        event.code.startsWith("Arrow")
    ) {
        event.preventDefault();
    }

    keys[event.code] = true;
    });

    document.addEventListener("keyup", function(event) {
    keys[event.code] = false;
    });

    function update() {
    if (gameOver) return;

    // Player horizontal movement.
    if (keys["ArrowRight"]) x += speed;
    if (keys["ArrowLeft"]) x -= speed;

    x = Math.max(0, x);

    // Jump.
    if (keys["ArrowUp"] && onGround) {
        vy = jumpStrength;
        onGround = false;
    }

    // Save the previous vertical position.
    let previousY = y;

    // Gravity and vertical movement.
    vy += gravity;
    y += vy;

    // The player is airborne until a landing occurs.
    onGround = false;

    // Ground collision.
    if (y >= groundY) {
        y = groundY;
        vy = 0;
        onGround = true;
    }

    // Platform collision: land from above only.
    if (vy >= 0) {
        for (let platform of platforms) {
    const previousBottom = previousY + size;
    const currentBottom = y + size;
    const previousTop = previousY;
    const currentTop = y;

    const overlapsHorizontally =
        x + size > platform.x &&
        x < platform.x + platform.width;

    const crossesTop =
        previousBottom <= platform.y &&
        currentBottom >= platform.y;

    const crossesBottom =
        previousTop >= platform.y + platform.height &&
        currentTop <= platform.y + platform.height;

    if (overlapsHorizontally) {
        // Land on the platform while falling.
        if (vy >= 0 && crossesTop) {
        y = platform.y - size;
        vy = 0;
        onGround = true;
        }

        // Stop the player from jumping up through the platform.
        else if (vy < 0 && crossesBottom) {
        y = platform.y + platform.height;
        vy = 0;
        }
    }
    }
    }

    // Camera.
    cameraX = Math.max(0, x - canvas.width * 0.4);

    // Shooting cooldown.
    if (shootCooldown > 0) {
        shootCooldown--;
    }

    if (keys["Space"] && shootCooldown === 0) {
        bullets.push({
        x: x + size,
        y: y + size / 2 - 2,
        speed: bulletSpeed
        });

        shootCooldown = shootDelay;
    }

    // Move bullets.
    for (let bullet of bullets) {
        bullet.x += bullet.speed;
    }

    // Enemies move left and stay on the ground.
    // Enemy AI.
for (let enemy of enemies) {
  const playerCenter = x + size / 2;
  const enemyCenter = enemy.x + enemy.size / 2;

  const distance = playerCenter - enemyCenter;
  const stopDistance = size + 8;

  if (Math.abs(distance) > stopDistance) {
    enemy.x += Math.sign(distance) * enemy.speed;
  }

  enemy.y = groundY;
}

    // Replace enemies passed by the player.
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x + enemies[i].size < x) {
        enemies.splice(i, 1);
        spawnEnemy();
        }
    }

    // Bullet-enemy collision.
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        for (let j = bullets.length - 1; j >= 0; j--) {
        const bullet = bullets[j];

        if (
            bullet.x < enemy.x + enemy.size &&
            bullet.x + 12 > enemy.x &&
            bullet.y < enemy.y + enemy.size &&
            bullet.y + 4 > enemy.y
        ) {
            bullets.splice(j, 1);
            enemy.health--;

            if (enemy.health <= 0) {
            enemies.splice(i, 1);
            score += 10;
            spawnEnemy();
            }

            break;
        }
        }
    }

    // Player-enemy collision.
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (
        x < enemy.x + enemy.size &&
        x + size > enemy.x &&
        y < enemy.y + enemy.size &&
        y + size > enemy.y
        ) {
        enemies.splice(i, 1);
        playerHealth--;

        if (playerHealth <= 0) {
            gameOver = true;
            break;
        }

        spawnEnemy();
        }
    }

    // Remove bullets outside the camera view.
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (
        bullets[i].x > cameraX + canvas.width ||
        bullets[i].x + 12 < cameraX
        ) {
        bullets.splice(i, 1);
        }
    }
    }

    function draw() {
    // Clear the canvas first.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky.
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scrolling mountains.
    ctx.fillStyle = "#527DA8";

    for (let i = -1; i < 6; i++) {
        const mountainX =
        i * 240 - (cameraX * 0.3) % 240;

        ctx.beginPath();
        ctx.moveTo(mountainX, 330);
        ctx.lineTo(mountainX + 120, 150);
        ctx.lineTo(mountainX + 240, 330);
        ctx.closePath();
        ctx.fill();
    }

    // Platforms.
    for (let platform of platforms) {
        const screenX = platform.x - cameraX;

        ctx.fillStyle = "#654321";
        ctx.fillRect(
        screenX,
        platform.y,
        platform.width,
        platform.height
        );

        ctx.fillStyle = "#55AA44";
        ctx.fillRect(
        screenX,
        platform.y,
        platform.width,
        5
        );
    }

    // Ground.
    ctx.fillStyle = "#654321";
    ctx.fillRect(
        0,
        canvas.height - groundHeight,
        canvas.width,
        groundHeight
    );

    // Player.
    ctx.fillStyle = "lime";
    ctx.fillRect(x - cameraX, y, size, size);

    // Bullets.
    ctx.fillStyle = "yellow";

    for (let bullet of bullets) {
        ctx.fillRect(
        bullet.x - cameraX,
        bullet.y,
        12,
        4
        );
    }

    // Enemies.
    ctx.fillStyle = "red";

    for (let enemy of enemies) {
        ctx.fillRect(
        enemy.x - cameraX,
        enemy.y,
        enemy.size,
        enemy.size
        );
    }

    // HUD.
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.fillText("Health: " + playerHealth, 20, 30);
    ctx.fillText("Score: " + score, 20, 60);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px monospace";
        ctx.fillText("GAME OVER", 280, 220);
    }
    }

    function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
    }

    document.getElementById("restart").addEventListener("click", resetGame);

    gameLoop();
