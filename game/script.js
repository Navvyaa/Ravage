const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/person.png';
const fireImage = new Image();
fireImage.src = 'assets/fire.gif'; // Load the fire GIF
const carImages = [
    'assets/cars/car1.png',
    'assets/cars/car2.png',
    'assets/cars/car3.png',
    'assets/cars/car4.png',
    'assets/cars/car5.png',
    'assets/cars/car6.png',
    'assets/cars/car7.png',
    'assets/cars/car8.png',
    'assets/cars/car9.png',
    'assets/cars/car10.png'
];
const carImagesRO = [
    'assets/carsRO/car1.png',
    'assets/carsRO/car2.png',
    'assets/carsRO/car3.png',
    'assets/carsRO/car4.png',
    'assets/carsRO/car5.png',
    'assets/carsRO/car6.png',
    'assets/carsRO/car7.png',
    'assets/carsRO/car8.png',
    'assets/carsRO/car9.png',
    'assets/carsRO/car10.png'
];

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

// Class for moving characters
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

// Class for the car
class Car {
    constructor(x1, y1, x2, y2, image) {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
        this.currentX = x1;
        this.currentY = y1;
        this.image = new Image();
        this.image.src = image;
        this.speed = 3; // Speed of car movement
        this.progress = 0; // Progress along the path (0 to 1)
        this.direction = 1; // 1 for forward, -1 for reverse
        this.angle = 0; // Angle for rotation (0 for normal, 180 for reverse)
    }

    // Update car position
    update() {
        let dx = this.endX - this.startX;
        let dy = this.endY - this.startY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        this.progress += this.speed / distance * this.direction;


        // if (this.progress < 1) {
        //     this.progress += this.speed / distance; // Update progress based on speed
        //     this.currentX = this.startX + dx * this.progress;
        //     this.currentY = this.startY + dy * this.progress;
        // }
        
        if (this.progress >= 1 || this.progress <= 0) {
            // Swap direction and rotate the car when it reaches the end
            this.direction *= -1;
            this.angle = (this.angle + 180) % 360; // Rotate 180 degrees
            this.progress = Math.max(0, Math.min(1, this.progress)); // Keep progress within bounds

            // Swap start and end points for reverse direction
            [this.startX, this.endX] = [this.endX, this.startX];
            [this.startY, this.endY] = [this.endY, this.startY];
        }

        // Update current position based on progress
        this.currentX = this.startX + dx * this.progress;
        this.currentY = this.startY + dy * this.progress;
    

    }

    // Draw the car
    draw() {
        const canvasCoords = convertToCanvasCoordinates(this.currentX, this.currentY);
        ctx.drawImage(this.image, canvasCoords.x - 25, canvasCoords.y - 25, 100, 100);
    }

}
// <area target="" alt="" title="" href="" coords="633,4,642,2980" shape="rect">
// Initialize car with coordinates
const car = new Car(789, 10, 792, 2900, carImages[0]);
const car1 = new Car(633, 4, 642, 2980, carImages[1]);
const car2 = new Car(1396, 1278, 1400, 2122, carImages[2]);
const car3 = new Car(1539, 1414, 1524, 2082, carImages[3]);
const car4 = new Car(3151, 1443, 3155, 2656, carImages[4]);
const car5 = new Car(3284, 1304, 3308, 2792, carImages[5]);
const car6 = new Car(3170, 2903, 3165, 4824, carImages[6]);
const car7 = new Car(3279, 3018, 3303, 4811, carImages[7]);
const car8 = new Car(4514, 3530, 4524, 4680, carImages[8]);
const car9 = new Car(2173, 2114, 2178, 4927, carImages[9]);
const car10 = new Car(2321, 2101, 2306, 4962, carImages[0]); 
const car11 = new Car(4500, 30, 4514, 2896, carImages[1]);
const car12 = new Car(4648, 51, 4658, 2889, carImages[2]);
const car13 = new Car(4643, 5308, 4648, 3625, carImages[3]);
const car14 = new Car(652, 5318, 647, 4583, carImages[4]);
const car15 = new Car(790, 4464, 795, 5332, carImages[5]);
const car16 = new Car(2645, 50, 2640, 575, carImages[6]);
const car17 = new Car(2764, 66, 2774, 528, carImages[7]);
const car18 = new Car(590, 4558, 690, 5375, carImages[8]);
const car19 = new Car(737, 4440, 833, 5370, carImages[9]);

const car20 = new Car(885, 4828, 2030, 4813, carImagesRO[2]); // 90 degrees rotation
const car21 = new Car(885, 4980, 2454, 4966, carImagesRO[3]); // 90 degrees rotation
const car22 = new Car(2931, 4831, 4333, 4845, carImagesRO[4]); // 90 degrees rotation
const car23 = new Car(2941, 4965, 4319, 4969, carImagesRO[5]); // 90 degrees rotation
const car24 = new Car(3437, 2777, 4381, 2782, carImagesRO[6]); // 90 degrees rotation
const car25 = new Car(3484, 2930, 5359, 2939, carImagesRO[7]); // 90 degrees rotation
const car26 = new Car(1663, 1411, 3050, 1425, carImagesRO[8]); // 90 degrees rotation
const car27 = new Car(1648, 1302, 3127, 1293, carImagesRO[9]); // 90 degrees rotation
const car28 = new Car(923, 626, 4338, 631, carImagesRO[0]); // Restart from carImages[0], 90 degrees rotation
const car29 = new Car(981, 739, 4324, 744, carImagesRO[1]); // 90 degrees rotation
const car30 = new Car(952, 2253, 1996, 2268, carImagesRO[2]); // 90 degrees rotation
const car31 = new Car(1028, 2115, 2144, 2101, carImagesRO[3]); // 90 degrees rotation
const car32 = new Car(2035, 3645, 41, 3659, carImagesRO[4]); // 90 degrees rotation
const car33 = new Car(2020, 3499, 41, 3490, carImagesRO[5]); // 90 degrees rotation
const car34 = new Car(4791, 1310, 5339, 1315, carImagesRO[6]); // 90 degrees rotation


const cars = [
    car, car1, car2, car3, car4, car5, car6, car7, car8, car9,
    car10, car11, car12, car13, car14, car15, car16, car17, car18, car19,
    car20, car21, car22, car23, car24, car25, car26, car27, car28, car29,
    car30, car31, car32, car33, car34
];
function updateCars() {
    cars.forEach(car => car.update());
}

function drawCars() {  
    cars.forEach(car => car.draw());

}
// const cars=[];
// cars.push(new Car(789,10,792,2900,carImages[0]));
// cars.push(new Car(590,6,718,2921,carImages[1]));
// cars.push(new Car(594,4550,7088,5406,carImages[2]));
// cars.push(new Car(709,4556,847,5400,carImages[3]));
// cars.push(new Car(2125,3566,2249,4758,carImages[4]));
// cars.push(new Car(1353,1229,1458,2169,carImages[5]));


// const verticalRoads = [
//     { x1: 590, y1: 6, x2: 718, y2: 2921 },   // First road
//     { x1: 594, y1: 4550, x2: 708, y2: 5406 }, // Second road
//     { x1: 709, y1: 4556, x2: 847, y2: 5400 }, // Third road
//     { x1: 2125, y1: 3566, x2: 2249, y2: 4758 }, // Fourth road
//     { x1: 1353, y1: 1229, x2: 1458, y2: 2169 }, // Fifth road
//     { x1: 1462, y1: 1223, x2: 1605, y2: 2172 }, // Sixth road
//     { x1: 3098, y1: 1231, x2: 3222, y2: 2852 }, // Seventh road
//     { x1: 2130, y1: 2052, x2: 2249, y2: 3435 }, // Eighth road
//     { x1: 2268, y1: 2047, x2: 2378, y2: 3425 }, // Ninth road
//     { x1: 3236, y1: 1219, x2: 3360, y2: 2850 }, // Tenth road
//     { x1: 3112, y1: 2862, x2: 3213, y2: 4755 }, // Eleventh road
//     { x1: 3237, y1: 2867, x2: 3351, y2: 4760 }, // Twelfth road
//     { x1: 2259, y1: 3570, x2: 2387, y2: 4757 }  // Thirteenth road
// ];



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

// In the draw function, continue to call update and draw
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

    // Update and draw the cars
    updateCars(); // Call the function to update cars
    drawCars(); // Call the function to draw cars

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
    updateCars();
    drawCars();
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
const totalImages = 6; // Updated for car images

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

carImages.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            gameLoop();
        }
    };
});