// Socket.io client-side setup
const SOCKET = io('http://localhost:3000');

// Basic Phaser setup
const CONFIG = {
    type: Phaser.AUTO,
    width: 500,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(CONFIG);

const START_X = 621;
const START_Y = 120;
const OFFSET_X = 15 * 2;
const OFFSET_Y = 8 * 2;
const TOTAL_TILES = 10;
let char, npc, npcA, npcB, npcC;
let isMoving = false;
let cursors;
let tilesArray = [];
let charactersArray = [];
let characterSprites = [];
const NPCs = [
    {x: 891, y: 264},
    {x: 621, y: 248}
];

let overlay, messageBox, yesButton, noButton, messageText, okButton ;
let overlayActive = false;

function preload() {
    this.load.image('floor', '/public/images/floor.png');
    this.load.image('milo', '/public/images/milo.png');
}

function create() {

    // Set the world bounds
    this.physics.world.setBounds(0, 0, 2000, 2000);

    //create a floor
    for (let i = 0; i < TOTAL_TILES; i++) {
        for (let j = 0; j < TOTAL_TILES; j++) {
            let x = START_X + j * OFFSET_X - i * OFFSET_X;
            let y = START_Y + j * OFFSET_Y + i * OFFSET_Y;

            this.add.image(x, y, 'floor').setScale(2);
            tilesArray.push({x, y});
        }
    }

    npcA = this.physics.add.sprite(351, 264, 'milo').setScale(2);
    npcB = this.physics.add.sprite(621, 120, 'milo').setScale(2);
    npcC = this.physics.add.sprite(891, 264, 'milo').setScale(2);

    npc = this.physics.add.sprite(621, 248, 'milo').setScale(2);
    char = this.physics.add.sprite(621, 312, 'milo').setScale(2);

    // After setting up everything related to the character's position, center the camera:
    // Directly set camera position
    this.cameras.main.scrollX = char.x - this.cameras.main.width / 2;
    this.cameras.main.scrollY = char.y - this.cameras.main.height / 2;

    // Then, set the camera to follow the character
    this.cameras.main.startFollow(char);

    // Make char and npcA interactive
    char.setInteractive();
    npcA.setInteractive();
    npcB.setInteractive();
    npcC.setInteractive();
    npc.setInteractive();

    // Assume 'Milo' is the name you want to display. Adjust accordingly.
    let milo = "Milo";
    let ansA = "Sydney";
    let ansB = "Melbourne";
    let ansC = "Canberra";

    setCharName.call(this, milo, char);
    setCharName.call(this, ansA, npcA);
    setCharName.call(this, ansB, npcB);
    setCharName.call(this, ansC, npcC);

    // Hover effects
    this.input.on('gameobjectover', function (pointer, gameObject) {
        if(overlayActive) 
            return
        gameObject.setTint(0x44ff44);  // Light green tint
        game.canvas.style.cursor = 'pointer';
    });

    this.input.on('gameobjectout', function (pointer, gameObject) {
        if(overlayActive) 
            return
        gameObject.clearTint();
        game.canvas.style.cursor = 'default';
    });

    npc.on('pointerdown', function (pointer) {
        showMessage(this.scene, 'Which of these is the capital of Australia?');
    });

    // Ensure the character won't move out of the world bounds
    char.setCollideWorldBounds(true);

    // Set up arrow key inputs
    cursors = this.input.keyboard.createCursorKeys();

    sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Create a text object for the character's coordinates.
    let coordinatesText = this.add.text(10, 10, "", {
        fontSize: '16px', 
        fill: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: { left: 5, right: 5, top: 2, bottom: 2 }
    }).setScrollFactor(0); // This ensures the text stays fixed relative to the camera.

    // Link the coordinates text to the character for easier access
    char.coordinatesText = coordinatesText;
    
}

function update() {

    // Update the nameText position to be above the character
    char.nameText.x = char.x;
    char.nameText.y = char.y - char.height/2;  // Adjust this value as needed to position the name correctly.

    // Update the nameText position to be above the character
    npcA.nameText.x = npcA.x;
    npcA.nameText.y = npcA.y - npcA.height/2;  // Adjust this value as needed to position the name correctly.

    
    // Update the nameText position to be above the character
    npcB.nameText.x = npcB.x;
    npcB.nameText.y = npcB.y - npcB.height/2;  // Adjust this value as needed to position the name correctly.

    
    // Update the nameText position to be above the character
    npcC.nameText.x = npcC.x;
    npcC.nameText.y = npcC.y - char.height/2;  // Adjust this value as needed to position the name correctly.

    char.coordinatesText.setText(`X: ${Math.round(char.x)}, Y: ${Math.round(char.y)}`);

    // Simple movement controls
    if (cursors.left.isDown) {
        char.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        char.setVelocityX(160);
    } else {
        char.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        char.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        char.setVelocityY(160);
    } else {
        char.setVelocityY(0);
    }

    if (!isMoving && !overlayActive) {
        let direction = null;
        if (wKey.isDown) {
            direction = 'up';
        } else if (sKey.isDown) {
            direction = 'down';
        } else if (aKey.isDown) {
            direction = 'left';
        } else if (dKey.isDown) {
            direction = 'right';
        }
    
        if (direction) {
            isMoving = true;
            moveCharacter(direction);
        } else {
            isMoving = false;
        }
    }
}

function setCharName(charName, char) {
    // Create a text object for the character's name
    let nameText = this.add.text(0, 0, charName, { 
        fontSize: '20px', 
        fill: '#ffffff',
        padding: { left: 5, right: 5, top: 2, bottom: 5 }
    }).setOrigin(0.5, 1); // Set origin to the center-bottom to position it correctly above the character.

    char.nameText = nameText;
}

function hasTileAt(x, y) {
    for (let tile of tilesArray) {
        if (tile.x === x && tile.y === y) {
            return true; // Found a tile at the specified position
        }
    }
    return false; // No tile found at the specified position
}

function hasCharacterAt(x, y) {
    for (let character of charactersArray) {
        if (character.x === x && character.y === y) {
            return true; // Found a character at the specified position
        }
    }
    return false; // No character found at the specified position
}

function moveCharacter(direction) {
    let targetX, targetY;

    switch (direction) {
        case 'down':
            targetX = char.x - OFFSET_X;
            targetY = char.y + OFFSET_Y;
            break;
        case 'up':
            targetX = char.x + OFFSET_X;
            targetY = char.y - OFFSET_Y;
            break;
        case 'left':
            targetX = char.x - OFFSET_X;
            targetY = char.y - OFFSET_Y;
            break;
        case 'right':
            targetX = char.x + OFFSET_X;
            targetY = char.y + OFFSET_Y;
            break;
        default:
            isMoving = false;
            throw new Error('Invalid direction');
    }

    if(hasTileAt(targetX, targetY) && !hasCharacterAt(targetX, targetY)) {
        char.scene.tweens.add({
            targets: char,
            x: targetX,
            y: targetY,
            duration: 100,
            ease: 'Linear',
            onComplete: function () {
                char.anims.stop();
                isMoving = false;
            }
        });
    }
    isMoving = false
}

function showMessage(scene, message) {
    const centerX = scene.cameras.main.worldView.centerX;
    const centerY = scene.cameras.main.worldView.centerY;

    overlayActive = true;
    // Create an overlay to dim the entire visible area of the camera
    overlay = scene.add.rectangle(centerX, centerY, scene.cameras.main.width, scene.cameras.main.height, 0x000000, 0.5).setInteractive();
    overlay.on('pointerdown', () => { /* block clicks on the game behind */ });

    // Create the message box in the center (I've increased the height to account for the multiple lines)
    messageBox = scene.add.rectangle(centerX, centerY, 600, 200, 0x2c3e50);

    // Add the message text inside the box
    messageText = scene.add.text(centerX, centerY - 60, message, {
        font: '20px Arial',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 570, useAdvancedWrap: true }
    }).setOrigin(0.5);

    // Add the "OK" button inside the box
    okButton = scene.add.text(centerX, centerY + 60, 'OK', {
        font: '25px Arial',
        fill: '#00ff00'
    }).setInteractive();

    okButton.setOrigin(0.5); // Center the button's origin

    // Handle click event for the "OK" button
    okButton.on('pointerdown', () => {
        closeMessage(scene);
    });
}


function closeMessage() {
    // Destroy elements related to the message
    overlay.destroy();
    messageBox.destroy();
    messageText.destroy();
    okButton.destroy();
    overlayActive = false;
}