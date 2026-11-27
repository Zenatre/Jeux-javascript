// Récupération du canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameSpeed = 5;
let score = 0;
let isGameOver = false;
// FOND QUI DÉFILE
const bgImage = new Image();
bgImage.src = 'fonds.png';
let bgX = 0;

// LE JOUEUR
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 50,
    vy: 0, // Vitesse verticale
    gravity: 0.6,
    jumpForce: -15,
    isJumping: false,
    color: '#000000', // Bleu

    draw: function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update: function() {
        //gravité
        this.vy += this.gravity;
        this.y += this.vy;

        // Collision
        const groundY = canvas.height - this.height;
        if (this.y > groundY) {
            this.y = groundY;
            this.vy = 0;
            this.isJumping = false;
        }
    },

    jump: function() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
        }
    }
};

// LES OBSTACLES
let obstacles = [];
const obstacleWidth = 20;
const obstacleHeight = 40;

function spawnObstacle() {
    // Apparaît à droite de l'écran
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight, // Au sol
        width: obstacleWidth,
        height: obstacleHeight,
        color: '#dd0a0a'
    });
}

// --- CONTRÔLES ---
document.addEventListener('keydown', function(event) {
    // Si on appuie sur Espace
    if (event.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } else {
            player.jump();
        }
    }
});

function update() {
    if (isGameOver) return;

    player.update();
     bgX -= gameSpeed * 0.5;
     if (gameSpeed < 15) {
        gameSpeed += 0.002;
    }
    if (bgX <= -canvas.width) {
        bgX = 0;
    }

    // Gestion des obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed; // L'obstacle avance vers la gauche (le joueur court vers la droite)

        // Si l'obstacle sort de l'écran, on le supprime et on augmente le score
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score += 10;
        }

        // Détection de collision (AABB - Axis-Aligned Bounding Box)
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            isGameOver = true;
        }
    }

    // Augmenter la difficulté progressivement
    if (Math.random() < 0.01) { // 1% de chance par frame de faire apparaître un obstacle
        spawnObstacle();
    }
}

function draw() {
    // Effacer l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Dessiner le sol
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Dessiner le joueur
    player.draw();



obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Dessiner le score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);

    // Écran de Game Over
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillText('Appuyez sur Espace pour recommencer', canvas.width / 2, canvas.height / 2 + 40);
        ctx.textAlign = 'left'; // Reset
    }
}


function resetGame() {
    obstacles = [];
    score = 0;
    isGameOver = false;
    player.y = canvas.height - player.height;
    player.vy = 0;
    gameSpeed = 5;
    bgX = 0;
}

// --- BOUCLE DE JEU (GAME LOOP) ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Lancer le jeu
gameLoop();
