const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/person.png';

canvasWidth = canvas.width = window.innerWidth;
canvasHeight = canvas.height = window.innerHeight;

let angle = 0;
let position = { x: 500, y: 0 };
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

const restrictedAreas = [
    { x1: 909, y1: 866, x2: 1290, y2: 1972 },
    { x1: 2569, y1: 2601, x2: 2913, y2: 2849 }
];

function isWithinRestrictedArea(newX, newY) {
    for (const area of restrictedAreas) {
        if (newX > area.x1 && newX < area.x2 && newY > area.y1 && newY < area.y2) {
            return true;
        }
    }
    return false;
}

class MovingCharacter {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = 30;
        this.speed = 0.5;
    }

    move() {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        if (this.x < 0 || this.x > mapImage.width || this.y < 0 || this.y > mapImage.height) {
            this.direction += Math.PI;
        }
    }

    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size;
    }

    reverseDirection() {
        this.direction += Math.PI;
    }

    draw() {
        ctx.drawImage(movingCharacterImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

let movingCharacters = [];
for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const direction = Math.random() * 2 * Math.PI;
    movingCharacters.push(new MovingCharacter(x, y, direction));
}

function handleCollisions() {
    for (let i = 0; i < movingCharacters.length; i++) {
        for (let j = i + 1; j < movingCharacters.length; j++) {
            if (movingCharacters[i].checkCollision(movingCharacters[j])) {
                movingCharacters[i].reverseDirection();
                movingCharacters[j].reverseDirection();
            }
        }
    }
}

function checkBulletCharacterCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        movingCharacters.forEach((character, charIndex) => {
            const dx = bullet.x - character.x;
            const dy = bullet.y - character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < character.size / 2) {
               
                movingCharacters.splice(charIndex, 1);
                bullets.splice(bulletIndex, 1);

               
                console.log("Character blasted!");
            }
        });
    });
}

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

    movingCharacters.forEach(character => character.draw());
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

    if (!isWithinRestrictedArea(newX, newY)) {
        position.x = newX;
        position.y = newY;
    } else {
        console.log("Restricted area, cannot move here!");
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvasWidth || bullet.y < 0 || bullet.y > canvasHeight) {
            bullets.splice(index, 1);
        }
    });

    movingCharacters.forEach(character => character.move());
    handleCollisions();
    checkBulletCharacterCollisions(); 
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
const totalImages = 3;

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

movingCharacterImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};
