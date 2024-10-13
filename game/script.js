const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/person.png';
const fireImage = new Image();
fireImage.src = 'assets/fire.gif';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angle = 0;
let position = { x: 500, y: 0 };
let zoomLevel = 1;
const step = 10;
const keys = {};
const characterScale = 0.07;

function convertToWorldCoordinates(x, y) {
    const mapXOffset = position.x - (canvas.width / (2 * zoomLevel));
    const mapYOffset = position.y - (canvas.height / (2 * zoomLevel));
    const worldX = (x / zoomLevel) + mapXOffset;
    const worldY = (y / zoomLevel) + mapYOffset;
    return { worldX, worldY };
}

class FireEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startTime = Date.now();
        this.duration = 5000;
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
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
    }

    update() {
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        const { worldX, worldY } = convertToWorldCoordinates(this.x, this.y);

        if (isWithinRestrictedArea(worldX, worldY)) {
            fireEffects.push(new FireEffect(worldX, worldY));
            const index = bullets.indexOf(this);
            if (index > -1) {
                bullets.splice(index, 1);
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
    { x1: 1875, y1: 893, x2: 2243, y2: 1118 },
    { x1: 967, y1: 2465, x2: 1316, y2: 2948 },
    { x1: 1574, y1: 2785, x2: 1918, y2: 3220 },
    { x1: 977, y1: 4008, x2: 1259, y2: 4582 },
    { x1: 987, y1: 4338, x2: 1560, y2: 4582 },
    { x1: 1698, y1: 4094, x2: 1961, y2: 4577 },
    { x1: 2601, y1: 3573, x2: 2859, y2: 3946 },
    { x1: 385, y1: 3894, x2: 748, y2: 4290 },
    { x1: 2554, y1: 2594, x2: 2917, y2: 2857 },
    { x1: 2597, y1: 1696, x2: 2888, y2: 2069 },
    { x1: 3504, y1: 1309, x2: 3853, y2: 1792 },
    { x1: 3643, y1: 3210, x2: 4197, y2: 3702 },
    { x1: 3638, y1: 4042, x2: 4202, y2: 4572 },
    { x1: 2912, y1: 908, x2: 3265, y2: 1113 },
    { x1: 4871, y1: 110, x2: 5129, y2: 607 },
    { x1: 69, y1: 205, x2: 413, y2: 693 },
    { x1: 1789, y1: 62, x2: 2453, y2: 392 },
    { x1: 2974, y1: 134, x2: 3538, y2: 358 },
    { x1: 3915, y1: 1882, x2: 4230, y2: 2542 },
    { x1: 3509, y1: 2202, x2: 4230, y2: 2527 },
    { x1: 2640, y1: 4347, x2: 2854, y2: 4562 },
    { x1: 4823, y1: 1796, x2: 5062, y2: 2097 },
    { x1: 5009, y1: 3937, x2: 5391, y2: 4190 },
{ x1: 189, y1: 803, x2: 415, y2: 1029 },
{ x1: 983, y1: 1089, x2: 1203, y2: 1309 },
{ x1: 173, y1: 1629, x2: 411, y2: 1867 },
{ x1: 205, y1: 1900, x2: 397, y2: 2092 }
,{ x1: 978, y1: 1506, x2: 1204, y2: 1732 }
,{ x1: 1539, y1: 872, x2: 1769, y2: 1102 }
,{ x1: 1759, y1: 1536, x2: 1989, y2: 1766 }
,{ x1: 2119, y1: 1557, x2: 2365, y2: 1803 }
,{ x1: 3773, y1: 234, x2: 3985, y2: 446 }
,{ x1: 4136, y1: 217, x2: 4362, y2: 443 }
,{ x1: 4852, y1: 773, x2: 5060, y2: 981 }
,{ x1: 3538, y1: 894, x2: 3750, y2: 1106 }
,{ x1: 3959, y1: 865, x2: 4217, y2: 1123 }
,{ x1: 5108, y1: 762, x2: 5370, y2: 1024 }
,{ x1: 4063, y1: 1299, x2: 4301, y2: 1537 }
,{ x1: 4064, y1: 1561, x2: 4294, y2: 1791 }
,{ x1: 3510, y1: 1961, x2: 3732, y2: 2183 }
,{ x1: 2641, y1: 2294, x2: 2881, y2: 2534 }
,{ x1: 2636, y1: 2876, x2: 2876, y2: 3116 }
,{ x1: 2628, y1: 3234, x2: 2878, y2: 3484 }
,{ x1: 1747, y1: 2358, x2: 1999, y2: 2610 }
,{ x1: 1376, y1: 2341, x2: 1638, y2: 2603 }
,{ x1: 581, y1: 3106, x2: 811, y2: 3336 }
,{ x1: 1023, y1: 3781, x2: 1283, y2: 4041 }
,{ x1: 1398, y1: 3801, x2: 1612, y2: 4015 }
,{ x1: 1733, y1: 3785, x2: 1983, y2: 4035 }
,{ x1: 1830, y1: 5096, x2: 2066, y2: 5332 }
,{ x1: 3377, y1: 5070, x2: 3613, y2: 5306 }
,{ x1: 4882, y1: 4791, x2: 5154, y2: 5063 }
,{ x1: 4908, y1: 5100, x2: 5138, y2: 5330 }
,{ x1: 3461, y1: 3610, x2: 3693, y2: 3842 }
,{ x1: 3432, y1: 4089, x2: 3656, y2: 4313 }
,{ x1: 4451, y1: 3080, x2: 4709, y2: 3338 }
,{ x1: 4745, y1: 3089, x2: 5007, y2: 3351 }
,{ x1: 5087, y1: 1608, x2: 5381, y2: 1902 }
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
        this.alive = true;
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
        if (!character.alive) return;

        bullets.forEach((bullet, bulletIndex) => {
            if (character.checkCollision(bullet)) {
                character.alive = false;
                bullets.splice(bulletIndex, 1);
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
    fireEffects.forEach(effect => effect.draw(ctx));

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

    if (event.key === ' ') {
        const bullet = new Bullet(
            (canvas.width / 2 + Math.sin(angle) * characterScale * characterImage.width * zoomLevel) / zoomLevel,
            (canvas.height / 2 - Math.cos(angle) * characterScale * characterImage.height * zoomLevel) / zoomLevel,
            angle
        );

        if (!isWithinRestrictedArea(bullet.x, bullet.y)) {
            bullets.push(bullet);
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
const totalImages = 4;

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
