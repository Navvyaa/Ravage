const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let health = 100;
let policeLevel = 0;
const starImage = new Image();
starImage.src = 'assets/star.PNG';
let newX, newY;
const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/persons.png';
const fireImage = new Image();
fireImage.src = 'assets/fire.gif';
const policeCarImage = new Image();
policeCarImage.src = 'assets/police_cars.png';
let helicopter = null;
const helicopterImage = 'assets/helicopter.gif';

const mainCharacter = {
    position: {
        x: 100,
        y: 100,
    },
    alive: true,
};
let mission_number = 0;
let address;
function drawGradient() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    // Define gradient colors (red on sides, transparent in the middle)
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(678 / canvas.width, 'transparent');
    gradient.addColorStop(1 - (678 / canvas.width), 'transparent');
    gradient.addColorStop(1, 'red');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let currentCharacterImage = characterImage;
class Helicopter {
    constructor(image) {
        this.x = newX - canvas.width / 2;
        this.y = newY - canvas.height / 2;
        this.image = new Image();
        this.image.src = image;
        this.speed = 1;
        this.angle = 0; // Angle to rotate the helicopter
    }

    // Method to update the helicopter's position and angle
    update(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle between helicopter and target (newX, newY)
        this.angle = Math.atan2(dy, dx); // Rotation angle in radians

        if (distance > 0) {
            // Move helicopter towards the target
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        if (policeLevel <= 5) {
            helicopter = null;

        }

        if (distance < 50 && policeLevel >= 5) {
            alert("Game Over!");
            helicopter = null;
            window.location.href = "game.html";
        }
    }

    // Method to check collision with other objects
    checkCollision(other) {
        const canvasCoords = convertToCanvasCoordinates(this.x, this.y);
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 70; // Assuming collision radius of 50
    }

    // Method to draw the helicopter with rotation
    draw(ctx) {
        const canvasCoords = convertToCanvasCoordinates(this.x, this.y);

        ctx.save(); // Save the current canvas state

        // Translate to the helicopter's position
        ctx.translate(canvasCoords.x, canvasCoords.y);

        // Rotate the canvas by the helicopter's angle
        ctx.rotate(this.angle);

        // Draw the helicopter image, centered at its current position
        ctx.drawImage(this.image, -50, -50, 100, 100); // -50, -50 to center the image

        ctx.restore(); // Restore the canvas state (to remove rotation)
    }

    getBoundingBox() {
        return {
            left: this.x - 50,
            right: this.x + 50,
            top: this.y - 50,
            bottom: this.y + 50,
        };
    }
}


function initializeHelicopter() {
    helicopter = new Helicopter(helicopterImage);
    console.log("helicopter");
}

function updateHelicopterSpeed() {
    if (helicopter) {
        helicopter.speed = 5 + (policeLevel * 0.05);
    }
}
function manageHelicopter() {
    if (policeLevel <= 5) {
        helicopter = null;
    }
}

function drawBars() {

    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthX = canvas.width - healthBarWidth - 20;
    const healthY = 20;


    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Health', healthX + healthBarWidth / 2 - ctx.measureText('Health').width / 2, healthY - 5);

    ctx.fillStyle = 'red';
    ctx.fillRect(healthX, healthY, healthBarWidth, healthBarHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(healthX, healthY, healthBarWidth * (health / 100), healthBarHeight);


    const starSize = 25;
    const starSpacing = 5;
    const starsX = canvas.width - (5 * starSize + 4 * starSpacing) - 20;
    const starsY = healthY + healthBarHeight + 30;


    ctx.fillStyle = 'white';
    ctx.fillText('Wanted Level', starsX + 2 * (starSize + starSpacing) - ctx.measureText('Wanted Level').width / 2, starsY - 5);


    const numberOfStars = Math.floor(policeLevel / 20);

    for (let i = 0; i < 5; i++) {
        if (i < numberOfStars) {
            ctx.drawImage(starImage, starsX + i * (starSize + starSpacing), starsY, starSize, starSize);
        } else {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(starImage, starsX + i * (starSize + starSpacing), starsY, starSize, starSize);
            ctx.globalAlpha = 1.0;
        }
    }
}

const carImages = [
    'assets/cars/car1.png',
    'assets/cars/car2.png',
    'assets/cars/car3.png',
    'assets/cars/car4.png',
    'assets/cars/car5.png',
    'assets/cars/car6.png',
    'assets/cars/car7.png',
]

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angle = 0;
let position = { x: 600, y: 600 };
let zoomLevel = 1;
let step = 5;
const keys = {};
let characterScale = 2;

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
            policeLevel += 0.1;
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
    , { x1: 978, y1: 1506, x2: 1204, y2: 1732 }
    , { x1: 1539, y1: 872, x2: 1769, y2: 1102 }
    , { x1: 1759, y1: 1536, x2: 1989, y2: 1766 }
    , { x1: 2119, y1: 1557, x2: 2365, y2: 1803 }
    , { x1: 3773, y1: 234, x2: 3985, y2: 446 }
    , { x1: 4136, y1: 217, x2: 4362, y2: 443 }
    , { x1: 4852, y1: 773, x2: 5060, y2: 981 }
    , { x1: 3538, y1: 894, x2: 3750, y2: 1106 }
    , { x1: 3959, y1: 865, x2: 4217, y2: 1123 }
    , { x1: 5108, y1: 762, x2: 5370, y2: 1024 }
    , { x1: 4063, y1: 1299, x2: 4301, y2: 1537 }
    , { x1: 4064, y1: 1561, x2: 4294, y2: 1791 }
    , { x1: 3510, y1: 1961, x2: 3732, y2: 2183 }
    , { x1: 2641, y1: 2294, x2: 2881, y2: 2534 }
    , { x1: 2636, y1: 2876, x2: 2876, y2: 3116 }
    , { x1: 2628, y1: 3234, x2: 2878, y2: 3484 }
    , { x1: 1747, y1: 2358, x2: 1999, y2: 2610 }
    , { x1: 1376, y1: 2341, x2: 1638, y2: 2603 }
    , { x1: 581, y1: 3106, x2: 811, y2: 3336 }
    , { x1: 1023, y1: 3781, x2: 1283, y2: 4041 }
    , { x1: 1398, y1: 3801, x2: 1612, y2: 4015 }
    , { x1: 1733, y1: 3785, x2: 1983, y2: 4035 }
    , { x1: 1830, y1: 5096, x2: 2066, y2: 5332 }
    , { x1: 3377, y1: 5070, x2: 3613, y2: 5306 }
    , { x1: 4882, y1: 4791, x2: 5154, y2: 5063 }
    , { x1: 4908, y1: 5100, x2: 5138, y2: 5330 }
    , { x1: 3461, y1: 3610, x2: 3693, y2: 3842 }
    , { x1: 3432, y1: 4089, x2: 3656, y2: 4313 }
    , { x1: 4451, y1: 3080, x2: 4709, y2: 3338 }
    , { x1: 4745, y1: 3089, x2: 5007, y2: 3351 }
    , { x1: 5087, y1: 1608, x2: 5381, y2: 1902 }
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



class Car {
    constructor(image, points) {
        // Validate and initialize waypoints
        this.waypoints = [];
        for (let i = 0; i < points.length; i += 2) {
            this.waypoints.push({ x: points[i], y: points[i + 1] });
        }
        // Set initial position to the first waypoint
        this.currentX = this.waypoints[0].x;
        this.currentY = this.waypoints[0].y;
        this.alive = true;
        this.image = new Image();
        this.image.src = image;
        this.speed = 3;
        this.progress = 0;
        this.direction = 1;
        this.angle = 0; // Initial angle (radians)
        this.size = 100;
        this.isPaused = false; // Flag to pause movement when collision is detected
        this.currentWaypoint = 0; // Start from the first waypoint
    }

    checkCollision(other) {
        const canvasCoords = convertToCanvasCoordinates(this.currentX, this.currentY);
        const dx = other.x - canvasCoords.x;
        const dy = other.y - canvasCoords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size;
    }
    
    
    update() {
        // If the car is paused (i.e., in collision) or not moving, don't update its position
        if (this.isPaused) return;
        
        const current = this.waypoints[this.currentWaypoint];
        
        // If the current waypoint is the last one, set its position and prepare for reset
        if (this.currentWaypoint === this.waypoints.length - 1) {
            this.currentX = current.x; // Set to the last waypoint
            this.currentY = current.y;
            // Reset to the first waypoint after a short delay (if needed)
            this.reset();
            return; // Exit the update function without moving
        }

        const next = this.waypoints[this.currentWaypoint + 1]; // Get the next waypoint
        
        let dx = next.x - current.x;
        let dy = next.y - current.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        this.progress += (this.speed / distance) * this.direction;
        
        const carBoundingBox = this.getBoundingBox();
        const characterBoundingBox = getCharacterBoundingBox();
        
        // Check for collision
        if (isCollision(carBoundingBox, characterBoundingBox)) {
            this.isPaused = true; // Pause movement if collision is detected
            return;
        } else {
            this.isPaused = false;
        }
        
        // Continue moving if the progress reaches the end of the current segment
        if (this.progress >= 1) {
            this.progress = 0;  // Reset progress
            this.currentWaypoint++; // Move to the next waypoint

            // If the currentWaypoint exceeds the length, reset to the first waypoint
            if (this.currentWaypoint >= this.waypoints.length) {
                this.currentWaypoint = 0; // Reset to the first waypoint
            }

            // Rotate by angle
            this.angle = Math.atan2(dy, dx); // Rotation angle in radians
        }

        // Update the car's current position based on progress
        this.currentX = current.x + dx * this.progress;
        this.currentY = current.y + dy * this.progress;
    }

    reset() {
        this.currentWaypoint = 0; // Reset to the first waypoint
        this.progress = 0; // Reset progress to start again
        this.angle = 0;
    }

    resumeMovement() {
        this.isPaused = false; // Resume movement after collision is no longer detected
    }

    getBoundingBox() {
        return {
            left: this.currentX - 25,
            right: this.currentX + 75,
            top: this.currentY - 25,
            bottom: this.currentY + 75,
        };
    }

    draw() {
        // Draw the car even if it's paused
        const canvasCoords = convertToCanvasCoordinates(this.currentX, this.currentY);

        // Save the canvas state before applying transformations
        ctx.save();

        // Move to the car's position and rotate the canvas
        ctx.translate(canvasCoords.x, canvasCoords.y);
        ctx.rotate(this.angle);

        ctx.drawImage(this.image, -50, -50, 100, 100); // Adjusting the origin to the car's center

        // Restore the canvas state to avoid affecting other drawings
        ctx.restore();
    }
}


// Example of creating a car with an array of points
const car = new Car(carImages[0], [789, 10, 777, 637, 4637, 617, 4649, 2799, 5397, 2795]);
const car1 = new Car(carImages[1], [2769, 9, 2781, 601, 4645, 625, 4641, 2789, 5397, 2801]);
const car2 = new Car(carImages[2], [4648,45,4662,1329, 5361,1313]);
const car3 = new Car(carImages[3], [641,25,641,1329, 41,1321]);
const car4 = new Car(carImages[4], [2617,5369,2617,4849, 2161,4849,2161,2241,665,2249,665,1481,33,1481]);
const car5 = new Car(carImages[5], [777,5321,777,4969, 4505,4953,4505,5345]);
const car6 = new Car(carImages[6], [2633,41,2641,737,809,753,785,2105, 1401,2105,1401,1297,3265,1297,3289,4793,4489,4809,4513,3545,5345,3489]);




const cars = [
    car, car1,car2,car3,car4,car5,car6
];
function updateCars() {
    cars.forEach(car => car.update());
}

function drawCars() {
    cars.forEach(car => car.draw());

}


const movingCharacterRestrictedAreas = [
    // Vertical Rectangle roads
    { x1: 583, y1: 11, x2: 860, y2: 2999 },
    { x1: 4440, y1: 17, x2: 4741, y2: 3008 },
    { x1: 3070, y1: 1231, x2: 3371, y2: 4751 },
    { x1: 2116, y1: 2035, x2: 2393, y2: 4749 },
    { x1: 599, y1: 4427, x2: 865, y2: 5405 },
    { x1: 4445, y1: 3434, x2: 4717, y2: 5391 },
    { x1: 2574, y1: 4767, x2: 2841, y2: 5393 },
    { x1: 2583, y1: 17, x2: 2841, y2: 537 },
    { x1: 1352, y1: 1235, x2: 1624, y2: 2299 },

    // Horizontal Rectangle roads
    { x1: 11, y1: 1252, x2: 588, y2: 1515 },
    { x1: 860, y1: 529, x2: 4440, y2: 816 },
    { x1: 1362, y1: 1228, x2: 3371, y2: 1500 },
    { x1: 4703, y1: 1238, x2: 5395, y2: 1511 },
    { x1: 588, y1: 2002, x2: 2412, y2: 2317 },
    { x1: 3108, y1: 2740, x2: 5404, y2: 3007 },
    { x1: 6, y1: 2727, x2: 865, y2: 2999 },
    { x1: 1, y1: 3427, x2: 2388, y2: 3709 },
    { x1: 1, y1: 4408, x2: 856, y2: 4675 },
    { x1: 856, y1: 4763, x2: 4708, y2: 5040 },
    { x1: 4455, y1: 3450, x2: 5400, y2: 3708 },
    { x1: 4731, y1: 4391, x2: 5400, y2: 4678 },

    // House area
    { x1: 972, y1: 2470, x2: 1321, y2: 2953 },
    { x1: 1579, y1: 2790, x2: 1923, y2: 3225 },
    { x1: 982, y1: 4013, x2: 1264, y2: 4587 },
    { x1: 992, y1: 4343, x2: 1565, y2: 4587 },
    { x1: 1703, y1: 4099, x2: 1966, y2: 4582 },
    { x1: 1880, y1: 898, x2: 2248, y2: 1123 },
    { x1: 2606, y1: 3578, x2: 2864, y2: 3951 },
    { x1: 390, y1: 3899, x2: 753, y2: 4295 },
    { x1: 2559, y1: 2599, x2: 2922, y2: 2862 },
    { x1: 2602, y1: 1701, x2: 2893, y2: 2074 },
    { x1: 3509, y1: 1314, x2: 3858, y2: 1797 },
    { x1: 3648, y1: 3215, x2: 4202, y2: 3707 },
    { x1: 3643, y1: 4047, x2: 4207, y2: 4577 },
    { x1: 2917, y1: 913, x2: 3270, y2: 1118 },
    { x1: 4876, y1: 115, x2: 5134, y2: 612 },
    { x1: 74, y1: 210, x2: 418, y2: 698 },
    { x1: 1794, y1: 67, x2: 2458, y2: 397 },
    { x1: 2979, y1: 139, x2: 3543, y2: 363 },
    { x1: 3920, y1: 1887, x2: 4235, y2: 2547 },
    { x1: 3514, y1: 2207, x2: 4235, y2: 2532 },
    { x1: 2645, y1: 4352, x2: 2859, y2: 4567 },
    { x1: 4828, y1: 1801, x2: 5067, y2: 2102 },
    { x1: 5014, y1: 3942, x2: 5396, y2: 4195 },

    // Tree Areas
    { x1: 194, y1: 808, x2: 420, y2: 1034 },
    { x1: 988, y1: 1094, x2: 1208, y2: 1314 },
    { x1: 178, y1: 1634, x2: 416, y2: 1872 },
    { x1: 210, y1: 1905, x2: 402, y2: 2097 },
    { x1: 983, y1: 1511, x2: 1209, y2: 1737 },
    { x1: 1544, y1: 877, x2: 1774, y2: 1107 },
    { x1: 1764, y1: 1541, x2: 1994, y2: 1771 },
    { x1: 2124, y1: 1562, x2: 2370, y2: 1808 },
    { x1: 3778, y1: 239, x2: 3990, y2: 451 },
    { x1: 4141, y1: 222, x2: 4367, y2: 448 },
    { x1: 4857, y1: 778, x2: 5065, y2: 986 },
    { x1: 3543, y1: 899, x2: 3755, y2: 1111 },
    { x1: 3964, y1: 870, x2: 4222, y2: 1128 },
    { x1: 5113, y1: 767, x2: 5375, y2: 1029 },
    { x1: 4068, y1: 1304, x2: 4306, y2: 1542 },
    { x1: 4069, y1: 1566, x2: 4299, y2: 1796 },
    { x1: 3515, y1: 1966, x2: 3737, y2: 2188 },
    { x1: 2646, y1: 2299, x2: 2886, y2: 2539 },
    { x1: 2641, y1: 2881, x2: 2881, y2: 3121 },
    { x1: 2633, y1: 3239, x2: 2883, y2: 3489 },
    { x1: 1752, y1: 2363, x2: 2004, y2: 2615 },
    { x1: 1381, y1: 2346, x2: 1643, y2: 2608 },
    { x1: 586, y1: 3111, x2: 816, y2: 3341 },
    { x1: 1028, y1: 3786, x2: 1288, y2: 4046 },
    { x1: 1403, y1: 3806, x2: 1617, y2: 4020 },
    { x1: 1738, y1: 3790, x2: 1988, y2: 4040 },
    { x1: 1835, y1: 5101, x2: 2071, y2: 5337 },
    { x1: 3382, y1: 5075, x2: 3618, y2: 5311 },
    { x1: 4887, y1: 4796, x2: 5159, y2: 5068 },
    { x1: 4913, y1: 5105, x2: 5143, y2: 5335 },
    { x1: 3466, y1: 3615, x2: 3698, y2: 3847 },
    { x1: 3437, y1: 4094, x2: 3661, y2: 4318 },
    { x1: 4456, y1: 3085, x2: 4714, y2: 3343 },
    { x1: 4750, y1: 3094, x2: 5012, y2: 3356 },
];





class MovingCharacter {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = 60;
        this.speed = 1;
        this.alive = true;
        this.avoidanceForce = 0.5;
    }

    move() {
        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;


        if (newX < 0 || newX > mapImage.width || newY < 0 || newY > mapImage.height) {
            this.direction += Math.PI / 2;
        } else if (isInRestrictedAreaForMovingChar(newX, newY)) {

            this.direction += Math.random() * 2 * this.avoidanceForce - this.avoidanceForce;
        } else {

            this.x = newX;
            this.y = newY;
        }
    }

    checkCollision(other) {
        const canvac = convertToCanvasCoordinates(this.x, this.y);
        const dx = other.x - canvac.x;
        const dy = other.y - canvac.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size;
    }

    reverseDirection() {
        this.direction += Math.PI;
    }

    draw() {
        if (this.alive) {
            const canvasCoords = convertToCanvasCoordinates(this.x - this.size / 2, this.y - this.size / 2)
            ctx.drawImage(movingCharacterImage, canvasCoords.x, canvasCoords.y, this.size, this.size);
        }

    }
}
const movingCharacters = [];
const numCharacters = 100;

function isInRestrictedAreaForMovingChar(x, y) {
    for (const area of movingCharacterRestrictedAreas) {
        if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
            return true;
        }
    }
    return false;
}

while (movingCharacters.length < numCharacters) {
    const x = Math.random() * 5408;
    const y = Math.random() * 5408;



    // Only generate a MovingCharacter if the position is valid
    if (!isInRestrictedAreaForMovingChar(x, y)) {
        const direction = Math.random() * 2 * Math.PI;
        movingCharacters.push(new MovingCharacter(Math.floor(x), Math.floor(y), direction));

    }
}

function handleCollisions() {
    movingCharacters.forEach((character, charIndex) => {
        if (!character.alive) return;

        bullets.forEach((bullet, bulletIndex) => {
            if (character.checkCollision(bullet)) {
                character.alive = false;
                bullets.splice(bulletIndex, 1);
                policeLevel += 5;
                if (policeLevel > 5 && !helicopter) {
                    initializeHelicopter();
                }
            }
        });
    });
}
function handleCarCollisions() {
    cars.forEach((car) => {

        bullets.forEach((bullet, bulletIndex) => {
            if (car.checkCollision(bullet)) {
                // Create a fire effect at the car's current position
                fireEffects.push(new FireEffect(car.currentX, car.currentY));
                car.reset();
                bullets.splice(bulletIndex, 1);
                policeLevel += 10;
            }

            if (helicopter && helicopter.checkCollision(bullet)) { // Added null check for helicopter
                fireEffects.push(new FireEffect(helicopter.x, helicopter.y)); // Use helicopter's y coordinate
                helicopter = null;
                initializeHelicopter(); // Reset the helicopter
                bullets.splice(bulletIndex, 1);
                policeLevel += 5;
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

    if (mission_number > 2) {
        alert("All Missions Completed");
        position.x = 3300;
        position.y = 1953;
        policeLevel = 0;
        return;
    }

    if (mission_number === 2 && policeLevel >= 100) {
        mission_number++;
        alert("Mission Completed");
        position.x = 3300;
        position.y = 1953;
        policeLevel = 0;
        return;
    }
    else if (mission_number === 2 && policeLevel < 100) {
        alert("Mission Failed");
        position.x = 3300;
        mission_number = 1;
        position.y = 1953;
        policeLevel = 0;
        return;
    }


    // Set up the video for the mission
    address = 'assets/mission${mission_number}.mp4';
    video = document.createElement('video');
    video.controls = false;
    video.style.display = "block";
    video.src = address;
    video.autoplay = true;
    video.style.position = 'absolute';
    video.style.top = 0;
    video.style.left = 0;
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.zIndex = 5;
    document.body.appendChild(video);
    mission_number++;
    position.x = 3300;
    position.y = 1953;
    policeLevel = 0;

    // Handle full screen on video play
    video.oncanplay = () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    // After the video ends, reset the position and allow the next mission
    video.onended = () => {
        document.body.removeChild(video);
        position.x = 3300;
        position.y = 1953;
        missionTriggered = false;
    };

    missionTriggered = true; // Mark the mission as triggered
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
    if (newX < 685) {
        const gradient = ctx.createLinearGradient(0, 0, 678, 0);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 678, canvas.height); // Draw gradient on left side
    }
    if (newX > 4720) {
        const gradient = ctx.createLinearGradient(canvas.width - 678, 0, canvas.width, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.6)');

        ctx.fillStyle = gradient;
        ctx.fillRect(canvas.width - 678, 0, 678, canvas.height); // Draw gradient on right side
    }
    if (newY > 5085) {
        const gradient = ctx.createLinearGradient(0, canvas.height - 678, 0, canvas.height);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.6)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 678, canvas.width, 678); // Draw gradient on bottom
    }
    if (newY < 324) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 678);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 678); // Draw gradient on top
    }
    bullets.forEach(bullet => {
        bullet.draw();
    });

    movingCharacters.forEach(character => character.draw());
    fireEffects.forEach(effect => effect.draw(ctx));

    // Update and draw the cars
    updateCars();
    drawCars();
    drawBars();

    fireEffects.forEach(effect => effect.draw(ctx));
    fireEffects = fireEffects.filter(effect => !effect.isExpired());
}
// Define character's position globally
function isCollision(bbox1, bbox2) {
    return !(bbox1.right < bbox2.left ||
        bbox1.left > bbox2.right ||
        bbox1.bottom < bbox2.top ||
        bbox1.top > bbox2.bottom);
}
// Define bounding box for the character
function getCharacterBoundingBox() {
    const charWidth = 50;
    const charHeight = 50;
    return {
        left: position.x - charWidth / 2,
        right: position.x + charWidth / 2,
        top: position.y - charHeight / 2,
        bottom: position.y + charHeight / 2,
    };
}
function update() {
    newX = mainCharacter.position.x = position.x;
    newY = mainCharacter.position.y = position.y;
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
    mainCharacter.position.x = newX;
    mainCharacter.position.y = newY;
    const halfCanvasWidth = (canvas.width / 2) / zoomLevel;
    const halfCanvasHeight = (canvas.height / 2) / zoomLevel;
    console.log(policeLevel);
    newX = Math.max(halfCanvasWidth, Math.min(newX, mapImage.width - halfCanvasWidth));
    newY = Math.max(halfCanvasHeight, Math.min(newY, mapImage.height - halfCanvasHeight));


    if (!isWithinRestrictedArea(newX, newY)) {
        position.x = newX;
        position.y = newY;
    }

    if (isWithinMissionArea(position.x, position.y) && !missionTriggered) {
        mission();
        console.log("mission");
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    movingCharacters.forEach(character => character.move());
    handleCollisions();

    handleCarCollisions();
}

let isPoliceCar = false;

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === 'f') {

        // Change to police car imagec
        if (!isPoliceCar) {
            step = 10;
            characterImage.src = 'assets/police_cars.png';
            characterScale = 0.15;
            console.log("Changed character to police car");
        } else {
            step = 5;
            characterImage.src = 'assets/character.png';
            characterScale = 2;
            console.log("Changed character back to regular character");
        }

        // Toggle the flag
        isPoliceCar = !isPoliceCar;
    }


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
    cars.forEach((car) => {
        car.update();  // Update each car's position

        // Get the bounding boxes for the current car and the main character
        const carBoundingBox = car.getBoundingBox();
        const characterBoundingBox = getCharacterBoundingBox();

        // Check if there's no collision
        if (!isCollision(carBoundingBox, characterBoundingBox)) {
            car.resumeMovement();  // Resume movement for cars not in collision
        }

        car.draw();  // Draw each car
    });

    car.draw();
    update();
    draw();
    updateHelicopterSpeed();

    // Make the helicopter follow the main character
    if (helicopter) {
        if (mainCharacter.alive) {
            helicopter.update(mainCharacter.position.x, mainCharacter.position.y);
        }
    }
    if (helicopter) helicopter.draw(ctx);

    requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
const totalImages = 6;

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