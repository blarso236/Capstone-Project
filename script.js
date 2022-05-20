/**
 * Creates a new player. 
 * @class
 * 
 * @property {number} level - starts at one and progresses
 * @property {number} health - keep this above zero
 * @property {string} weapon - ties to an object with a damage rating
 * @property {object} coords - location on the grid
 * @property {number} xp - experience points
 */ 
 class Player {
    constructor(level, health, weapon, coords, xp) {
      this.level = level;
      this.health = health;
      this.weapon = weapon;
      this.coords = coords;
      this.xp = xp;
    }
  }


/**
 * Creates a new enemy. 
 * @class
 * 
 * @property {Number} health
 * @property {Object} coords
 * @property {Number} damage
 */ 
 class Enemy {
    constructor(health, coords, damage) {
      this.health = health;
      this.coords = coords;
      this.damage = damage;
    }
  }


  class Game {
    constructor() {
      this.map = [];
      this.shadow = [];
      this.isShadowToggled = false;
      this.enemies = [];
      this.canvas = null;
      this.context = null;
    }
  }

/**
 * Reset all level-specific properties
 */ 
 Game.prototype.reset = function() {
    this.enemies = [];
    this.shadow = [];
    this.map = [];
  }


const POINTS_PER_LEVEL = 100;

const COLS = 80;
const ROWS = 60;

const TILE_DIM = 10;

const WALL_CODE = 0;
const FLOOR_CODE = 1;
const PLAYER_CODE = 2;
const ENEMY_CODE = 3;
const POTION_CODE = 4;
const WEAPON_CODE = 5;


const TILE_COLORS = [

    // wall
    'grey',

    // floor
    'white',

    // player
    'blue',

    // enemy
    'red',

    // health potion
    'green',
    
    // weapon
    'orange'
];

SHADOW_CODE = 0;
VISIBLE_CODE = 1;


const TOTAL_ENEMIES = 10;
const STARTING_POTIONS_AMOUNT = 4;
const STARTING_WEAPONS_AMOUNT = 3;


// possible health that enemies can have
const ENEMIES_HEALTH = [30, 30, 30, 30, 40, 40, 60, 80];

// possible damage that enemies can inflict
const ENEMIES_DAMAGE = [30, 30, 30, 30, 40, 40, 60, 80];


const POTIONS = [10, 20, 30, 40, 50];

/**
 * Constants
 */
const WEAPONS = [{
    name: "Dagger",
    damage: 15
    },
    {
        name: "Sword",
        damage: 30
    },
    {
        name: "Hammer",
        damage: 60
    },
    {
        name: "Axe",
        damage:100
    }
];


const VISIBILITY = 3;


function createDOM() {

    let container = document.getElementById('container');

    let hud = document.createElement('ul');

    hud.id = 'hud';

    let labels = ['XP', 'Level', 'Health', 'Weapon', 'Damage', 'Enemies'];

    for (var label of labels) {
        hud = addStat(label, hud);
    }
    // add the heads-up display
    container.appendChild(hud);

    // add canvas
    let canvas = document.createElement('canvas');
    canvas.id = 'grid';
    
    const tileDim = 10;
    
    canvas.height = ROWS*tileDim;
    canvas.width = COLS*tileDim;
    
    container.appendChild(canvas);

    // create the button
    let btn = document.createElement('button');
    btn.className = 'toggle';
    btn.textContent = 'Toggle Shadow';
    container.appendChild(btn);
    
    btn.addEventListener('click',toggleShadow);
}

/**
 * @param {Sring} label - the visible label of the stat
 * @param {HTMLElement} container - the parent container we add it to
 */
function addStat(label, container) {
    let el = document.createElement('li');
    let id = label.toLowerCase();
    let value = 0;
    el.innerHTML = `<label>${label}</label>: <span id="${id}" ${value}></span>`
    container.appendChild(el);
    return container;
}


function toggleShadow() {
    Game.isShadowToggled =
    !game.isShadowToggled;
}

var game = null;
var player = null;

function init() {
    createDOM();
    game = new Game();

    game.canvas = document.getElementById("grid");
    game.context =
    game.canvas.getContext("2d");
    startGame();
}
init();

function generateMap() {
    // generate a solid wall.
    for (var row = 0; row < ROWS; row++) {
       // create row
       game.map.push([]);
 
       for (var col = 0; col < COLS; col++) {
          // create wall
          game.map[row].push(WALL_CODE);
       }
    }
    // set up total number of tiles used
    // and the total number of penalties made
 
    
    let pos = { 
       x:COLS/2,
       y:ROWS/2
    };
 
    const ATTEMPTS = 30000;
    const MAX_PENALTIES_COUNT = 1000;
    const MINIMUM_TILES_AMOUNT = 1000;
    const OUTER_LIMIT = 3;
 
    const randomDirection = () => Math.random() <= 0.5 ? -1 : 1;
 
    let tiles = 0, penalties = 0;
 
    for (var i = 0; i < ATTEMPTS; i++) {
 
       // choose an axis to dig on.
       let axis = Math.random() <= 0.5 ? 'x' : 'y';
 
       // get the number of rows or columns, depending on the axis.
       let numCells = axis == 'x' ? COLS : ROWS;
 
       // choose the positive or negative direction.
       pos[axis] += randomDirection();
 
       // if we are on the far left or far right, find another value.
 
       // we don't want to dig here so let's find a way to get out
       while (pos[axis] < OUTER_LIMIT || pos[axis] >= numCells - OUTER_LIMIT) {
 
             pos[axis] += randomDirection();
 
             penalties++;
 
             if (penalties > MAX_PENALTIES_COUNT) {
 
                // if we have used up our tiles, we're done.
                if (tiles >= MINIMUM_TILES_AMOUNT) {
                   return;
                }
                   // bring coords back to center
                pos.x = COLS / 2;
                pos.y = ROWS / 2;
             }
       } 
 
       let {x, y} = pos;
 
       // if not a floor, make this a floor
       if (game.map[y][x] != FLOOR_CODE) {
 
          game.map[y][x] = FLOOR_CODE;
          // we use up a tile.
          tiles++;
       }
       penalties = 0;
 
    } // end the large loop
 }

function startGame() {
    generateMap();

    setTimeout(gameSetUp, 1000);

    function gameSetUp() {

        generatePlayer();

        drawMap(0, 0, COLS, ROWS);
    }
}

/**
 * @param {Number} x
 * @param {Number} y
 * @param {String} color
 */

function drawObject(x, y, color) {
    game.context.beginPath();
    game.context.rect(x * TILE_DIM, y * TILE_DIM, TILE_DIM, TILE_DIM);
    game.context.fillstyle = color;
    game.context.fill();
}

function drawMap(startX, startY, endX, endY) {

    let colors = [
       // wall
       'grey',
       // floor
       'white',
       // player
       'blue',
       // enemy
       'red',
       // health drop
       'green',
       // weapon
       'orange'
    ];
 
    // loop through all cells of the map
    for (var row = startY; row < endY; row++) {
 
       for (var col = startX; col < endX; col++) {
 
          let c_idx = game.map[row][col];
 
          let color = colors[c_idx];
          
          drawObject(col, row, color);
 
       } // end loop
    }
 }

function addObjToMap(coords, tileCode) {

    game.map[coords.y] [coords.x] = tileCode;
}

function generateValidCoords() {

    var x, y;

    do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
    }
    while (game.map [y] [x] != FLOOR_CODE);

    return {
        x: x,
        y: y
    };
}

function generatePlayer() {
    
    var coords =
    generateValidCoords();

    // parameters: level, health, weapon, coords, xp

    player = new player(1, 100, WEAPONS[0], coords, 30);

    addObjToMap(player.coords, PLAYER_CODE);
}

/**
 * 
 * @param {Number} amount 
 */
function generateEnemies(amount) {
    for (var i = 0; i < amount; i++)
    {

        let coords = generateValidCoords();

        let health = pickRandom(ENEMIES_HEALTH);

        let damage = new Enemy(health, coords, damage,);

        game.enemies.push(enemy);

        addObjToMap(coords, ENEMY_CODE);
    }
}