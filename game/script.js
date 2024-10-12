const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let angle = 0;
let position = { x: 0, y: 0 };
let zoomLevel = 1;
const step = 2;
const keys = {};

const characterScale = 0.07;

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
    }

    update() {
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

let bullets = [];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    
    const mapX = Math.max(Math.min(-position.x + canvasWidth / (2 * zoomLevel), 0), -(mapImage.width - canvasWidth / zoomLevel));
    const mapY = Math.max(Math.min(-position.y + canvasHeight / (2 * zoomLevel), 0), -(mapImage.height - canvasHeight / zoomLevel));
    
    ctx.drawImage(mapImage, mapX, mapY);
    ctx.restore();

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(angle);

    const characterWidth = characterImage.width * characterScale * zoomLevel;
    const characterHeight = characterImage.height * characterScale * zoomLevel;
    ctx.drawImage(characterImage, -characterWidth / 2, -characterHeight / 2, characterWidth, characterHeight);
    ctx.restore();

    bullets.forEach(bullet => {
        bullet.draw();
    });
}

function update() {
    let newX = position.x;
    let newY = position.y;

    if (keys['a']) {
        angle -= 0.05;
    }
    if (keys['d']) {
        angle += 0.05;
    }
    if (keys['w']) {
        newX += Math.sin(angle) * step;
        newY -= Math.cos(angle) * step;
    }
    if (keys['s']) {
        newX -= Math.sin(angle) * step;
        newY += Math.cos(angle) * step;
    }

    const halfCanvasWidth = (canvasWidth / 2) / zoomLevel;
    const halfCanvasHeight = (canvasHeight / 2) / zoomLevel;

    newX = Math.max(halfCanvasWidth, Math.min(newX, mapImage.width - halfCanvasWidth));
    newY = Math.max(halfCanvasHeight, Math.min(newY, mapImage.height - halfCanvasHeight));

    position.x = newX;
    position.y = newY;

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvasWidth || bullet.y < 0 || bullet.y > canvasHeight) {
            bullets.splice(index, 1);
        }
    });
}

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    if (event.key === '+') {
        zoomLevel = Math.min(zoomLevel + 0.1, 3);
    } else if (event.key === '-') {
        zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    }

    if (event.key === ' ') {
        const bullet = new Bullet(
            canvasWidth / 2 + Math.sin(angle) * characterScale * characterImage.width * zoomLevel,
            canvasHeight / 2 - Math.cos(angle) * characterScale * characterImage.height * zoomLevel,
            angle
        );
        bullets.push(bullet);
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
const totalImages = 2;

mapImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

characterImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};
