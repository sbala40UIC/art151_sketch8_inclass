
//SKETCH 8
//COMPLETED BY: Sanjaai Bala
///DATE: 11/16/26



 // KAPLAY SETUP

kaplay({

  // button setup
  buttons: {
    moveUp: {
      keyboard: ["up", "w"],
      gamepad: ["dpad-up"],
    },
    moveDown: {
      keyboard: ["down", "s"],
      gamepad: ["dpad-down"],
    },
    moveLeft: {
      keyboard: ["left", "a"],
      gamepad: ["dpad-left"],
    },
    moveRight: {
      keyboard: ["right", "d"],
      gamepad: ["dpad-right"],
    },
    shoot: {
      keyboard: ["space"],
      gamepad: ["rightshoulder"],
    },
  },

  // background color
  background: [211, 211, 211],

});


// GLOBAL VARIABLES

const SPEED = 120;
const JUMP_FORCE = 500;
const DEADZONE = 0.15;

let soundEffect;
let isPlaying = false;
let bgm;

let timeLeft = 30;
let gameScore = 0;


// SPRITES

// player sprite

loadSprite("player", "assets/player-sprite.png", {

  sliceX: 4,
  sliceY: 5,

  anims: {

    idle: {
        from: 0,
        to: 0,
    },

    left: {
        from: 8,
        to: 11,
        loop: true,
        speed: 8,
    },

    back: {
        from: 16,
        to: 19,
        loop: true,
        speed: 8,
    },

  }

});


// enemy sprite

loadSprite("enemy", "assets/Orc_Walk.png", {
    sliceX: 8,
    sliceY: 1,

    anims: {
        walk: {
            from: 0,
            to: 7,
            loop: true,
            speed: 8,
        },
    },
});


// collectible sprite

loadSprite("gold", "assets/gold-sack.webp");


// AUDIO ASSETS

loadSound("Orc-Sound", "assets/Orc.wav");

loadSound("music", "assets/8bit-loop-120bpm.wav");


// HELPERS

function playSoundEffect() {

  if (!isPlaying) {

    isPlaying = true;

    play("Orc-Sound", {
      volume: 0.04,
    });

    wait(0.3, () => {
      isPlaying = false;
    });

  }

}


function makePlatform(x, y, w, colorValue) {

  add([
    rect(w, 40),
    area(),
    outline(6),
    pos(x, y),
    body({ isStatic: true }),
    color(colorValue),
    "platform",
  ]);

}


function spawnCollectible() {

  add([
    sprite("gold"),
    pos(
      rand(40, width() - 40),
      rand(80, height() - 100)
    ),
    scale(0.25),
    rotate(rand(0, 65)),
    area(),
    scale(0.01),
    anchor("center"),
    "collectible",
  ]);

}


function spawnEnemy() {

    const enemy = add([
        sprite("enemy"),

        pos(
            rand(100, width() - 100),
            100
        ),

        scale(2),
        anchor("center"),

        area({
            shape: new Rect(vec2(-9, -6), 18, 12),
        }),

        body(),

        "enemy",
    ]);

    enemy.play("walk");

}


function spawnEnemyWave(player) {

    const amount = randi(2, 5);

    for (let i = 0; i < amount; i++) {
        spawnEnemy(player);
    }

}



// LEVEL CREATION

function createLevel(levelNumber) {

  setGravity(640);

  let facingX = 1;
  let facingY = 0;

  let sceneChanging = false;


  // SCORE DISPLAY

  const scoreText = add([

    text("Score: " + gameScore, {
      size: 24,
    }),

    pos(24, 24),
    color(BLACK),
    fixed(),

  ]);


  // TIMER DISPLAY

  const timerText = add([

    text("Time: " + Math.ceil(timeLeft), {
      size: 24,
    }),

    pos(width() - 150, 24),
    color(BLACK),
    fixed(),

  ]);


  // PLAYER SETUP

  const player = add([

    sprite("player"),
    pos(
      levelNumber === 1 ? 80 : width() - 80,
      height() - 100
    ),
    anchor("center"),
    area(),

    body({
      jumpForce: JUMP_FORCE,
    }),

    doubleJump(),

  ]);
  



  // LEVEL EXIT

  if (levelNumber === 1) {

    add([

      rect(20, height()),
      pos(width() - 20, 0),
      area(),
      color(GREEN),
      "levelExit",

    ]);

  } else {

    add([

      rect(20, height()),
      pos(0, 0),
      area(),
      color(GREEN),
      "levelExit",

    ]);

  }



  // PLATFORMS

  // floor platform

  makePlatform(
    0,
    height() - 24,
    width(),
    MAGENTA
  );


  // random platforms

  for (let i = 0; i < 5; i++) {

    makePlatform(

      rand(0, width() - 250),

      height() - 150 - (i * 100),

      rand(50, 230),

      rgb(
        rand(0, 255),
        0,
        rand(0, 255)
      )

    );

  }



  // COLLECTIBLES

  for (let i = 0; i < 5; i++) {

    spawnCollectible();

  }

  loop(5, () => {

    if (!sceneChanging) {
      spawnCollectible();
    }

  });



  // ENEMIES

  spawnEnemyWave();

  loop(15, () => {

    if (!sceneChanging) {
      spawnEnemyWave();
    }

  });



  // CONTROLS

// Move right
onButtonDown("moveRight", () => {
    player.move(SPEED, 0);

    facingX = 1;
    facingY = 0;

    player.flipX = false;
});

// Move left
onButtonDown("moveLeft", () => {
    player.move(-SPEED, 0);

    facingX = -1;
    facingY = 0;

    player.flipX = true;
});

// Jump
onButtonPress("moveUp", () => {
    player.doubleJump();

    facingX = 0;
    facingY = -1;
});

// Move down
onButtonDown("moveDown", () => {
    player.move(0, SPEED);

    facingX = 0;
    facingY = 1;
});


// ANIMATION CONTROL

onUpdate(() => {

    if (isButtonDown("moveLeft") || isButtonDown("moveRight")) {

        if (player.curAnim() !== "left") {
            player.play("left");
        }

    } else if (isButtonDown("moveDown")) {

        if (player.curAnim() !== "back") {
            player.play("back");
        }

    } else {

        if (player.curAnim() !== "idle") {
            player.play("idle");
        }

    }

});



  // PROJECTILES

  function shoot() {

    const dx = facingX;
    const dy = facingY;

    const bullet = add([

      rect(12, 8),
      pos(player.pos.x, player.pos.y),
      area(),
      anchor("center"),
      color(YELLOW),
      "bullet",

    ]);


    // projectile movement

    bullet.onUpdate(() => {

      bullet.move(dx * 400, dy * 400);

    });


    // remove projectile after a short time

    wait(2, () => {

      destroy(bullet);

    });

  }


  // SHOOT CONTROLS

  onButtonPress("shoot", () => {

    shoot();

  });



  // CAMERA

  onUpdate(() => {

    camPos(player.pos);

  });



  // TIMER & JOYSTICK (ANALOG) MOVEMENT

  onUpdate((dt) => {

    // movement logic
    // WASD and gamepad D-pad movement are handled above.


    // timer logic

    if (timeLeft > 0) {

      timeLeft -= dt;

      timerText.text = "Time: " + Math.ceil(timeLeft);

    }


    // win check / lose check

    if (timeLeft <= 0 && !sceneChanging) {

      sceneChanging = true;

      go("lose");

    }

  });



  // COLLISIONS

  player.onCollide("collectible", (item) => {

    // collect logic

    destroy(item);

    gameScore += 10;

    scoreText.text = "Score: " + gameScore;

  });



  player.onCollide("enemy", () => {

    // lose logic

    if (!sceneChanging) {

      sceneChanging = true;

      go("lose");

    }

  });



  onCollide("bullet", "enemy", (bullet, enemy) => {

    // projectile collision

    destroy(bullet);

    destroy(enemy);

    gameScore += 5;

    scoreText.text = "Score: " + gameScore;

  });



  // TRANSITION EFFECT

  // fade overlay is omitted so it doesn't interfere with scene changes.



  player.onCollide("levelExit", () => {

    // level transition

    if (sceneChanging) return;

    sceneChanging = true;

    if (levelNumber === 1) {

      go("level2");

    } else {

      go("win");

    }

  });

}



// LVL 1 SCENE

scene("level1", () => {

  createLevel(1);

});



// LVL 2 SCENE

scene("level2", () => {

  createLevel(2);

});



// WIN GAME SCENE

scene("win", () => {

  add([

    text("YOU WIN!", {
      size: 48,
    }),

    pos(center().x, center().y - 60),
    anchor("center"),
    color(GREEN),

  ]);


  add([

    text("Final Score: " + gameScore, {
      size: 24,
    }),

    pos(center().x, center().y),
    anchor("center"),
    color(BLACK),

  ]);


  add([

    text("Press ENTER to restart", {
      size: 20,
    }),

    pos(center().x, center().y + 60),
    anchor("center"),
    color(BLACK),

  ]);


  onKeyPress("enter", () => {

    // reset variables

    timeLeft = 30;
    gameScore = 0;

    // restart game

    go("level1");

  });

});



// LOSE GAME SCENE

scene("lose", () => {

  add([

    text("GAME OVER", {
      size: 48,
    }),

    pos(center().x, center().y - 60),
    anchor("center"),
    color(RED),

  ]);


  add([

    text("Final Score: " + gameScore, {
      size: 24,
    }),

    pos(center().x, center().y),
    anchor("center"),
    color(BLACK),

  ]);


  add([

    text("Press ENTER to restart", {
      size: 20,
    }),

    pos(center().x, center().y + 60),
    anchor("center"),
    color(BLACK),

  ]);


  onKeyPress("enter", () => {

    // reset variables

    timeLeft = 30;
    gameScore = 0;

    // restart game

    go("level1");

  });

});



// MUSIC CONTROLS

onKeyPress("m", () => {

  if (!bgm) {

    bgm = play("music", {
      loop: true,
      volume: 0.15,
    });

  } else {

    bgm.stop();
    bgm = null;

  }

});



// RESET GAME

// START LEVEL 1

go("level1");
