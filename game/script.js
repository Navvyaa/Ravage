const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let health = 100; // Initial health
let policeLevel = 0; // Initial police level
const starImage = new Image();
starImage.src = 'assets/star.PNG'; // Load your star image
// Load images
const mapImage = new Image();
mapImage.src = 'assets/map.jpg';
const characterImage = new Image();
characterImage.src = 'assets/character.png';
const movingCharacterImage = new Image();
movingCharacterImage.src = 'assets/person.png';
const fireImage = new Image();
fireImage.src = 'assets/fire.gif'; // Load the fire GIF
const policeCarImage = new Image();
policeCarImage.src = 'assets/police_cars.png'; // Load police car image

let currentCharacterImage = characterImage; // Use currentCharacterImage to track the image

function drawBars() {
    // Health Bar
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthX = canvas.width - healthBarWidth - 20;
    const healthY = 20;

    // Draw Health Bar Heading
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Health', healthX + healthBarWidth / 2 - ctx.measureText('Health').width / 2, healthY - 5);

    ctx.fillStyle = 'red';
    ctx.fillRect(healthX, healthY, healthBarWidth, healthBarHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(healthX, healthY, healthBarWidth * (health / 100), healthBarHeight);

    // Star-based Police Level
    const starSize = 25; // Size of each star
    const starSpacing = 5; // Space between stars
    const starsX = canvas.width - (5 * starSize + 4 * starSpacing) - 20; // Adjust starting position
    const starsY = healthY + healthBarHeight + 30; // Position stars below the health bar

    // Draw Police Level Heading
    ctx.fillStyle = 'white';
    ctx.fillText('Wanted Level', starsX + 2 * (starSize + starSpacing) - ctx.measureText('Wanted Level').width / 2, starsY - 5);

    // Draw stars according to the police level
    const numberOfStars = Math.floor(policeLevel / 20); // 1 star for every 20% of police level

    for (let i = 0; i < 5; i++) {
        if (i < numberOfStars) {
            ctx.drawImage(starImage, starsX + i * (starSize + starSpacing), starsY, starSize, starSize); // Full star
        } else {
            ctx.globalAlpha = 0.3; // Dim the empty stars
            ctx.drawImage(starImage, starsX + i * (starSize + starSpacing), starsY, starSize, starSize); // Empty star
            ctx.globalAlpha = 1.0; // Reset alpha
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
let step = 5;
const keys = {};
let characterScale = 0.07;

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

const movingCharacterRestrictedAreas = [
    // Vertical Rectangle roads
    { x1: 578, y1: 6, x2: 855, y2: 2994 },
    { x1: 4435, y1: 12, x2: 4736, y2: 3003 },
    { x1: 3065, y1: 1226, x2: 3366, y2: 4746 },
    { x1: 2111, y1: 2030, x2: 2388, y2: 4744 },
    { x1: 594, y1: 4422, x2: 860, y2: 5400 },
    { x1: 4440, y1: 3429, x2: 4712, y2: 5386 },
    { x1: 2569, y1: 4762, x2: 2836, y2: 5388 },
    { x1: 2578, y1: 12, x2: 2836, y2: 532 },
    { x1: 1347, y1: 1230, x2: 1619, y2: 2294 },
    
    // Horizontal Rectangle roads
    { x1: 6, y1: 1247, x2: 583, y2: 1510 },
    { x1: 855, y1: 524, x2: 4435, y2: 811 },
    { x1: 1357, y1: 1223, x2: 3366, y2: 1495 },
    { x1: 4698, y1: 1233, x2: 5390, y2: 1506 },
    { x1: 583, y1: 1997, x2: 2407, y2: 2312 },
    { x1: 3103, y1: 2735, x2: 5399, y2: 3002 },
    { x1: 1, y1: 2722, x2: 860, y2: 2994 },
    { x1: -4, y1: 3422, x2: 2383, y2: 3704 },
    { x1: -4, y1: 4403, x2: 851, y2: 4670 },
    { x1: 851, y1: 4758, x2: 4703, y2: 5035 },
    { x1: 4450, y1: 3445, x2: 5395, y2: 3703 },
    { x1: 4726, y1: 4386, x2: 5395, y2: 4673 },
    
    
        //house area
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
    
        // Tree Areas
        { x1: 189, y1: 803, x2: 415, y2: 1029 },
        { x1: 983, y1: 1089, x2: 1203, y2: 1309 },
        { x1: 173, y1: 1629, x2: 411, y2: 1867 },
        { x1: 205, y1: 1900, x2: 397, y2: 2092 },
        { x1: 978, y1: 1506, x2: 1204, y2: 1732 },
        { x1: 1539, y1: 872, x2: 1769, y2: 1102 },
        { x1: 1759, y1: 1536, x2: 1989, y2: 1766 },
        { x1: 2119, y1: 1557, x2: 2365, y2: 1803 },
        { x1: 3773, y1: 234, x2: 3985, y2: 446 },
        { x1: 4136, y1: 217, x2: 4362, y2: 443 },
        { x1: 4852, y1: 773, x2: 5060, y2: 981 },
        { x1: 3538, y1: 894, x2: 3750, y2: 1106 },
        { x1: 3959, y1: 865, x2: 4217, y2: 1123 },
        { x1: 5108, y1: 762, x2: 5370, y2: 1024 },
        { x1: 4063, y1: 1299, x2: 4301, y2: 1537 },
        { x1: 4064, y1: 1561, x2: 4294, y2: 1791 },
        { x1: 3510, y1: 1961, x2: 3732, y2: 2183 },
        { x1: 2641, y1: 2294, x2: 2881, y2: 2534 },
        { x1: 2636, y1: 2876, x2: 2876, y2: 3116 },
        { x1: 2628, y1: 3234, x2: 2878, y2: 3484 },
        { x1: 1747, y1: 2358, x2: 1999, y2: 2610 },
        { x1: 1376, y1: 2341, x2: 1638, y2: 2603 },
        { x1: 581, y1: 3106, x2: 811, y2: 3336 },
        { x1: 1023, y1: 3781, x2: 1283, y2: 4041 },
        { x1: 1398, y1: 3801, x2: 1612, y2: 4015 },
        { x1: 1733, y1: 3785, x2: 1983, y2: 4035 },
        { x1: 1830, y1: 5096, x2: 2066, y2: 5332 },
        { x1: 3377, y1: 5070, x2: 3613, y2: 5306 },
        { x1: 4882, y1: 4791, x2: 5154, y2: 5063 },
        { x1: 4908, y1: 5100, x2: 5138, y2: 5330 },
        { x1: 3461, y1: 3610, x2: 3693, y2: 3842 },
        { x1: 3432, y1: 4089, x2: 3656, y2: 4313 },
        { x1: 4451, y1: 3080, x2: 4709, y2: 3338 },
        { x1: 4745, y1: 3089, x2: 5007, y2: 3351 },
    ];
    
    
    
    
    
    class MovingCharacter {
        constructor(x, y, direction) {
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.size = 60;
            this.speed = 1;
            this.alive = true; // Track if the character is alive
        }
    
        move() {
            const newX = this.x + Math.cos(this.direction) * this.speed;
            const newY = this.y + Math.sin(this.direction) * this.speed;
    
            // Check if the new position is within the map boundaries
            if (newX < 0 || newX > mapImage.width || newY < 0 || newY > mapImage.height) {
                this.direction += Math.PI; // Reverse direction
            } else if (isInRestrictedAreaForMovingChar(newX, newY)) {
                // If the new position is in a restricted area, change direction randomly
                this.direction = Math.random() * 2 * Math.PI;
            } else {
                // Update position if it's valid (not out of bounds and not in restricted area)
                this.x = newX;
                this.y = newY;
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
                const canvasCoords = convertToCanvasCoordinates(this.x - this.size / 2, this.y - this.size / 2)
                ctx.drawImage(movingCharacterImage, canvasCoords.x, canvasCoords.y, this.size, this.size);
            }
    
        }
    }
    const movingCharacters = [];
    const numCharacters = 250;
    
    function isInRestrictedAreaForMovingChar(x, y) {
        for (const area of movingCharacterRestrictedAreas) {
            if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
                return true; // The position is in a restricted area
            }
        }
        return false; // The position is valid (not in a restricted area)
    }
    
    while (movingCharacters.length < numCharacters) {
        const x = Math.random() * 5408;
        const y = Math.random() * 5408 ;
        
        
    
        // Only generate a MovingCharacter if the position is valid
        if (!isInRestrictedAreaForMovingChar(x, y)) {
            const direction = Math.random() * 2 * Math.PI;
            movingCharacters.push(new MovingCharacter(x,y, direction));
           
        }
    }
    
function handleCollisions() {
    movingCharacters.forEach((character, charIndex) => {
        if (!character.alive) return;

        bullets.forEach((bullet, bulletIndex) => {
            if (character.checkCollision(bullet)) {
                character.alive = false;
                bullets.splice(bulletIndex, 1);
                policeLevel += 5; // Increase police level on hit
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
    policeLevel = 0;

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
    drawCars();
    drawBars(); // Call the function to draw cars

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

let isPoliceCar = false; // Flag to track whether the character is a police car or not

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    if (event.key === 'f') {
        console.log(characterImage.src);
        
        // Change to police car imagec
        if (!isPoliceCar) { // If current character is not a police car
            step = 10; // Increase step for police car
            characterImage.src = 'assets/police_cars.png'; // Change image to police car
            characterScale = 0.5; // Adjust scale for police car
            console.log("Changed character to police car");
        } else { // If current character is a police car
            step = 5; // Reset step for normal character
            characterImage.src = 'assets/character.png'; // Change image back to normal character
            characterScale = 0.07; // Reset scale for normal character
            console.log("Changed character back to regular character");
        }
        
        // Toggle the flag
        isPoliceCar = !isPoliceCar; // Switch the flag to the opposite state
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