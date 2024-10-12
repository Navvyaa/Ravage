const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/person.png';
const fireImage = new Image();
fireImage.src = 'assets/fire.gif'; // Load the fire GIF

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angle = 0;
let position = { x: 500, y: 0 };
let zoomLevel = 1;
const step = 10;
const keys = {};
const characterScale = 0.07;

// Convert canvas coordinates to world coordinates in pixels
function convertToWorldCoordinates(x, y) {
    const mapXOffset = position.x - (canvas.width / (2 * zoomLevel));
    const mapYOffset = position.y - (canvas.height / (2 * zoomLevel));
    const worldX = (x / zoomLevel) + mapXOffset;
    const worldY = (y / zoomLevel) + mapYOffset;
    return { worldX, worldY };
}

// Class for fire effects
class FireEffect {
    constructor(x, y) {
        this.x = x; // World coordinates
        this.y = y; // World coordinates
        this.startTime = Date.now();
        this.duration = 1000; // Duration to show fire in milliseconds
    }

    isExpired() {
        return Date.now() - this.startTime > this.duration;
    }

    draw(ctx) {
        const canvasCoords = convertToCanvasCoordinates(this.x, this.y);
        ctx.drawImage(fireImage, canvasCoords.x - 25, canvasCoords.y - 25, 50, 50);
    }
}

let fireEffects = [];

class Bullet {
    constructor(x, y, angle) {
        this.x = x; // Canvas coordinates
        this.y = y; // Canvas coordinates
        this.angle = angle;
        this.speed = 5; // Speed in pixels per update
    }

    update() {
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        const { worldX, worldY } = convertToWorldCoordinates(this.x, this.y);

        // Check if the bullet hits a restricted area
        if (isWithinRestrictedArea(worldX, worldY)) {
            fireEffects.push(new FireEffect(worldX, worldY)); // Create fire effect at world coordinates
            const index = bullets.indexOf(this);
            if (index > -1) {
                bullets.splice(index, 1); // Remove bullet
            }
        }
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
    { x1: 1875, y1: 893, x2: 2243, y2: 1118 },  // Area 1
    { x1: 967, y1: 2465, x2: 1316, y2: 2948 },  // Area 2
    { x1: 1574, y1: 2785, x2: 1918, y2: 3220 }, // Area 3
    { x1: 977, y1: 4008, x2: 1259, y2: 4582 },  // Area 4
    { x1: 987, y1: 4338, x2: 1560, y2: 4582 },  // Area 5
    { x1: 1698, y1: 4094, x2: 1961, y2: 4577 }, // Area 6
    { x1: 2601, y1: 3573, x2: 2859, y2: 3946 }, // Area 7
    { x1: 385, y1: 3894, x2: 748, y2: 4290 },   // Area 8
    { x1: 2554, y1: 2594, x2: 2917, y2: 2857 }, // Area 9
    { x1: 2597, y1: 1696, x2: 2888, y2: 2069 }, // Area 10
    { x1: 3504, y1: 1309, x2: 3853, y2: 1792 }, // Area 11
    { x1: 3643, y1: 3210, x2: 4197, y2: 3702 }, // Area 12
    { x1: 3638, y1: 4042, x2: 4202, y2: 4572 }, // Area 13
    { x1: 2912, y1: 908, x2: 3265, y2: 1113 },  // Area 14
    { x1: 4871, y1: 110, x2: 5129, y2: 607 },   // Area 15
    { x1: 69, y1: 205, x2: 413, y2: 693 },      // Area 16
    { x1: 1789, y1: 62, x2: 2453, y2: 392 },    // Area 17
    { x1: 2974, y1: 134, x2: 3538, y2: 358 },   // Area 18
    { x1: 3915, y1: 1882, x2: 4230, y2: 2542 }, // Area 19
    { x1: 3509, y1: 2202, x2: 4230, y2: 2527 }, // Area 20
    { x1: 2640, y1: 4347, x2: 2854, y2: 4562 }, // Area 21
    { x1: 4823, y1: 1796, x2: 5062, y2: 2097 }, // Area 22
    { x1: 5009, y1: 3937, x2: 5391, y2: 4190 }, // Area 23
];

const missionArea = { x1: 3513, y1: 1953, x2: 4209, y2: 2521 };

let missionTriggered = false;
let video;

function isWithinRestrictedArea(newX, newY) {
    return restrictedAreas.some(area =>
        newX > area.x1 && newX < area.x2 && newY > area.y1 && newY < area.y2
    );
}

function convertToCanvasCoordinates(worldX, worldY) {
    const mapXOffset = position.x - (canvas.width / (2 * zoomLevel));
    const mapYOffset = position.y - (canvas.height / (2 * zoomLevel));
    const canvasX = (worldX - mapXOffset) * zoomLevel;
    const canvasY = (worldY - mapYOffset) * zoomLevel;
    return { x: canvasX, y: canvasY };
}

class MovingCharacter {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = 30;
        this.speed = 0.5;
        this.alive = true; // Track if the character is alive
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
        if (this.alive) {
            ctx.drawImage(movingCharacterImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
    }
}

let movingCharacters = [];
for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const direction = Math.random() * 2 * Math.PI;
    movingCharacters.push(new MovingCharacter(x, y, direction));
}

function handleCollisions() {
    movingCharacters.forEach((character, charIndex) => {
        if (!character.alive) return; // Skip if character is already dead

        bullets.forEach((bullet, bulletIndex) => {
            if (character.checkCollision(bullet)) {
                character.alive = false; // Mark character as dead
                bullets.splice(bulletIndex, 1); // Remove the bullet
            }
        });
    });
}

function isWithinMissionArea(x, y) {
    return (
        x >= missionArea.x1 &&
        x <= missionArea.x2 &&
        y >= missionArea.y1 &&
        y <= missionArea.y2
    );
}

function mission() {
    if (missionTriggered) return;

    video = document.createElement('video');
    video.controls = false;
    video.style.display = "block";
    video.src = 'assets/mission1.mp4';
    video.autoplay = true;
    video.style.position = 'absolute';
    video.style.top = 0;
    video.style.left = 0;
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.zIndex = 2; 
    document.body.appendChild(video);

    video.oncanplay = () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    video.onended = () => {
        document.body.removeChild(video);
        position.x = 3300;
        position.y = 1953;
        missionTriggered = false;
    };

    missionTriggered = true;
}

function exitVideo() {
    if (video) {
        document.body.removeChild(video);
        missionTriggered = false;
        position.x = 3300;
        position.y = 1953;
        video = null;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    const mapX = Math.max(Math.min(-position.x + canvas.width / (2 * zoomLevel), 0), -(mapImage.width - canvas.width / zoomLevel));
    const mapY = Math.max(Math.min(-position.y + canvas.height / (2 * zoomLevel), 0), -(mapImage.height - canvas.height / zoomLevel));

    ctx.drawImage(mapImage, mapX, mapY);
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);

    const characterWidth = characterImage.width * characterScale * zoomLevel;
    const characterHeight = characterImage.height * characterScale * zoomLevel;
    ctx.drawImage(characterImage, -characterWidth / 2, -characterHeight / 2, characterWidth, characterHeight);
    ctx.restore();

    bullets.forEach(bullet => {
        bullet.draw();
    });

    movingCharacters.forEach(character => character.draw());
    fireEffects.forEach(effect => effect.draw(ctx)); // Draw fire effects

    // Remove expired fire effects
    fireEffects = fireEffects.filter(effect => !effect.isExpired());
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

    const halfCanvasWidth = (canvas.width / 2) / zoomLevel;
    const halfCanvasHeight = (canvas.height / 2) / zoomLevel;

    newX = Math.max(halfCanvasWidth, Math.min(newX, mapImage.width - halfCanvasWidth));
    newY = Math.max(halfCanvasHeight, Math.min(newY, mapImage.height - halfCanvasHeight));

    if (!isWithinRestrictedArea(newX, newY)) {
        position.x = newX;
        position.y = newY;
    } else {
        console.log("Restricted area, can't move here!");
    }

    if (isWithinMissionArea(position.x, position.y) && !missionTriggered) {
        mission();
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    movingCharacters.forEach(character => character.move());
    handleCollisions();
}

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    // if (event.key === '+') {
    //     zoomLevel = Math.min(zoomLevel + 0.1, 3);
    // } else if (event.key === '-') {
    //     zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    // }

    if (event.key === ' ') {
        const bullet = new Bullet(
            (canvas.width / 2 + Math.sin(angle) * characterScale * characterImage.width * zoomLevel) / zoomLevel,
            (canvas.height / 2 - Math.cos(angle) * characterScale * characterImage.height * zoomLevel) / zoomLevel,
            angle
        );

        if (!isWithinRestrictedArea(bullet.x, bullet.y)) {
            bullets.push(bullet); // Only add if not in a restricted area
        }
    }

    if (event.key === 'Enter') {
        exitVideo();
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
const totalImages = 4; // Updated for fire effect

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

fireImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};
