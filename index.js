//Setting Up Canvas and Boundaries
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;
const offset = {
    x: -740,
    y: -650
}
const battle = {
    start: false
}
class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }
    draw() {
        ctx.fillStyle = 'rgba(255,0,0,0.0)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}


// Collisions
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}
const boundaries = [];
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

// Battle Zones
const battleZonesMap = [];
for (let i = 0; i < battleAreas.length; i += 70) {
    battleZonesMap.push(battleAreas.slice(i, 70 + i))
}
const battleZones = [];
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})


//Importing Map
const mapImg = new Image;
mapImg.src = './Img/PelletTown.png';
const foregroundImg = new Image;
foregroundImg.src = './Img/foregroundImg.png'

//Setting Up Charcter
const playerDown = new Image();
playerDown.src = './Img/playerDown.png';
const playerUp = new Image();
playerUp.src = './Img/playerUp.png';
const playerLeft = new Image();
playerLeft.src = './Img/playerLeft.png';
const playerRight = new Image();
playerRight.src = './Img/playerRight.png';


// Sprites for Objects
class Sprite {
    constructor({ position, image, frame = { max: 1 }, sprites }) {
        this.position = position;
        this.image = image;
        this.frame = { ...frame, val: 0, elapsed: 0 };
        // val is for moving the frame on sprite sheet
        // elapsed is for slower the motion (fps)
        this.image.onload = () => {
            this.width = this.image.width / this.frame.max
            this.height = this.image.height
        }
        this.moving = false;
        this.sprites = sprites;
    }
    draw() {
        // Darwing (Map // Player) =>
        // context.drawImage(Image , [4 Crop Values] , [2 Position Values] , [Dimensions] )
        ctx.drawImage(this.image,
            this.frame.val * this.width,
            0,
            this.image.width / this.frame.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frame.max,
            this.image.height
        )
        // For Player Movement
        if (this.moving) {
            if (this.frame.max > 1) {
                this.frame.elapsed++
            }
            if (this.frame.elapsed % 10 === 0) {
                if (this.frame.val < this.frame.max - 1) {
                    this.frame.val++;
                } else {
                    this.frame.val = 0;
                }
            }
        }
    }
}
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: mapImg
})
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImg
})
const player = new Sprite({
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDown,
    frame: {
        max: 4
    },
    //For Moving Player 
    sprites: {
        up: playerUp,
        down: playerDown,
        left: playerLeft,
        right: playerRight,
    }
})


// Controls
const movables = [background, foreground, ...boundaries, ...battleZones];
const keys = {
    arrowUp: { pressed: false },
    arrowDown: { pressed: false },
    arrowLeft: { pressed: false },
    arrowRight: { pressed: false }
};
let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.arrowUp.pressed = true;
            lastKey = 'Up'
            break
        case 'ArrowDown':
            keys.arrowDown.pressed = true;
            lastKey = 'Down'
            break
        case 'ArrowLeft':
            keys.arrowLeft.pressed = true;
            lastKey = 'Left'
            break
        case 'ArrowRight':
            keys.arrowRight.pressed = true;
            lastKey = 'Right'
            break
    }
})
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.arrowUp.pressed = false;
            break
        case 'ArrowDown':
            keys.arrowDown.pressed = false;
            break
        case 'ArrowLeft':
            keys.arrowLeft.pressed = false;
            break
        case 'ArrowRight':
            keys.arrowRight.pressed = false;
            break
    }
})


// Collision Check Function
// Rectangle1 = player , Rectangle2 = Boundaries
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x
        && rectangle1.position.x <= rectangle2.position.x + rectangle2.width
        && rectangle1.position.y + rectangle1.height <= rectangle2.position.y + rectangle2.height
        && rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}


// Rendering Function
function animation() {
    window.requestAnimationFrame(animation);
    //
    // Drawing
    background.draw();
    boundaries.forEach((boundary) => {
        boundary.draw();
    });
    battleZones.forEach((battleZone) => {
        battleZone.draw();
    })
    player.draw();
    foreground.draw();

    let moving = true;
    player.moving = false;
    
    //
    //Battle Zone Colliding // Battle Start
    if (battle.start) return
    if (keys.arrowUp.pressed
        || keys.arrowDown.pressed
        || keys.arrowLeft.pressed
        || keys.arrowRight.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            // Overlapping area is the area between 2 rectangles
            // (Calculated Width) * (Calculated Height) Using Min/Max
            // let overlappingArea = (
            //     Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width)
            //     - Math.max(player.position.x, battleZone.position.x)
            // ) * (
            //         Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height)
            //         - Math.max(player.position.y, battleZone.position.y)
            //     )
            // Colliding Check Statement
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                })
                // && overlappingArea > (player.width * player.height) / 2
                && Math.random() < 0.03 
            ) {
                console.log('tmm');
                battle.start = true;
                break
            }
        }
    }
    //
    // Controlling Animation
    if (keys.arrowUp.pressed && lastKey === 'Up') {
        player.moving = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            // Colliding Check Statement
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary, position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false;
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 3
            })
        }
    } else if (keys.arrowDown.pressed && lastKey === 'Down') {
        player.moving = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            // Colliding Check Statement
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary, position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false;
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y -= 3
            })
        }
    } else if (keys.arrowLeft.pressed && lastKey === 'Left') {
        player.moving = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            // Colliding Check Statement
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary, position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.x += 3
            })
        }
    } else if (keys.arrowRight.pressed && lastKey === 'Right') {
        player.moving = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            // Colliding Check Statement
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary, position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.x -= 3
            })
        }
    }
}
animation();

