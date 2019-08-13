import { Asteroid } from "./Asteroid";
import { Bullet, BulletType } from "./Bullet";
import { LeftsideBullet, LeftsideBulletType } from "./LeftsideBullet";
import { RightsideBullet, RightsideBulletType } from "./RightsideBullet";
import { BacksideBullet, BacksideBulletType } from "./BacksideBullet";
import { Enemy } from "./Enemy";
import { Background } from "./Background";
import { Upgrade } from "./Upgrade";
import { EnemyHolder } from "./EnemyHolder";

// The class that controls the game.
export class Play extends Phaser.Scene 
{
  // A variable representing the player (his ship, sprite).
  player: Phaser.Physics.Arcade.Sprite;

  // Variable for the selected object.
  pickup: Phaser.Physics.Arcade.Sprite;

  // Variable for extra life.
  heal: Phaser.Physics.Arcade.Sprite;

  // Variable for shield energy regenerator.
  shieldBooster: Phaser.Physics.Arcade.Sprite;

  // Variable for explosion effect.
  explosionEffect : Phaser.Physics.Arcade.Sprite;

  // Variable for scaling how many pieces a player’s ship will fall into.
  pc: number = 8;

  // Pieces of a player.
  playerPieces: Phaser.Physics.Arcade.Sprite[];

  // We create groups with physics for individual types of objects.
  asteroids: Phaser.Physics.Arcade.Group;
  lasers: Phaser.Physics.Arcade.Group;
  leftsideLasers: Phaser.Physics.Arcade.Group;
  rightsideLasers: Phaser.Physics.Arcade.Group;
  backsideLasers: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  background: Phaser.Physics.Arcade.Group;

  // Variable for control commands.
  moveKeys: {[key:string]:Phaser.Input.Keyboard.Key};

  // List of predefined enemies.
  enemyHolders: EnemyHolder[];

  // Variables for counting the time from the moment of the last spawn (enemy, equipment).
  lastSpawn: number = 0;
  lastPickupSpawn: number = 0;
  lastHealSpawn: number = 0;
  lastShieldBoosterSpawn: number = 0;

  // The values of interface elements (scores).
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;

  // Health
  health: number = 3;
  healthSprites: {[key: number]: Phaser.Physics.Arcade.Sprite};
  healthText: Phaser.GameObjects.Text;

  // Shield
  shieldActive: boolean = true;
  shield: Phaser.Physics.Arcade.Sprite;
  shieldText: Phaser.GameObjects.Text;
  shieldEnergy: number = 100;

  // The variable in which we will count the number of missed enemies.
  missedEnemies: number = 0;
  missedEnemiesText: Phaser.GameObjects.Text;

  // Armament.
  gunType: number = 0; 
  lastSideShooted: number = 0;
  upgrades: Phaser.Physics.Arcade.Group;
  currentBullet: BulletType;
  currentLeftsideBullet: LeftsideBulletType;
  currentRightsideBullet: RightsideBulletType;
  currentBacksideBullet: BacksideBulletType;
  shootCooldown: number = 300;
  upgradeCooldown: number = 0;

  playerEnemyCollier: Phaser.Physics.Arcade.Collider;

  constructor() 
  {
    super ("Play");
  }

  // The method that initializes the game.
  create() 
  {
    console.log("Play.create()");

    this.background = this.physics.add.group
    ({
      classType: Background,
      maxSize: 300,
      runChildUpdate: true
    });

    // Add and customize the player’s ship.
    this.player = this.physics.add.sprite(320, 500, "playership1").setScale(0.5, 0.5);
    this.player.body.collideWorldBounds = true;
    this.player.body.width *= 0.5;
    this.player.body.height *= 0.5;
    this.player.body.setCircle (27);
    this.player.depth = 10;
    this.gunType = 0;
    this.currentBullet = BulletType.Default;
    this.currentLeftsideBullet = LeftsideBulletType.Default;
    this.currentRightsideBullet = RightsideBulletType.Default;
    this.currentBacksideBullet = BacksideBulletType.Default;

    // Add a sprite shield to the scene.
    this.shield = this.physics.add.sprite(320, 500, "shield1").setScale(0.5, 0.5);
    this.shield.body.width *= 0.5;
    this.shield.body.height *= 0.5;
    
    // Add and customize extra lives.
    this.heal = this.physics.add.sprite(320, 500, "life").setScale(0.5, 0.5);
    this.heal.body.collideWorldBounds = true;
    this.heal.body.width *= 0.5;
    this.heal.body.height *= 0.5;
    this.heal.setActive(false).setVisible(false);
    this.lastHealSpawn = 0;

    // Add and customize the shield restorer.
    this.shieldBooster = this.physics.add.sprite(320, 500, "booster").setScale(0.5, 0.5);
    this.shieldBooster.body.collideWorldBounds = true;
    this.shieldBooster.body.width *= 0.5;
    this.shieldBooster.body.height *= 0.5;
    this.shieldBooster.setActive(false).setVisible(false);
    this.lastShieldBoosterSpawn = 0;

    // Add and customize the gold stars (gain).
    this.pickup = this.physics.add.sprite(320, 500, "star").setScale(0.5, 0.5);
    this.pickup.body.collideWorldBounds = true;
    this.pickup.body.width *= 0.5;
    this.pickup.body.height *= 0.5;
    this.pickup.setActive(false).setVisible(false);
    this.lastPickupSpawn = 0;
    
    // We determine the size of the pieces into which the player’s ship will be divided, based on its size and scale factor.
    let pw: number = this.player.width / this.pc;
    let ph: number = this.player.height / this.pc;
    this.playerPieces = [];
    
    // In a cycle we go through the player’s ship, dividing it into parts.
    for (let i: number = 0; i < this.pc; ++i) 
    {
      for (let j: number = 0; j < this.pc; ++j) 
      {
        // We trim the player’s ship, separating a piece of the specified size from it in a separate sprite.
        let pp: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(320, 500, "playership1").setScale(0.5, 0.5).setCrop(i*pw, j*ph, pw, ph);

        // This piece is invisible.
        pp.setActive(false).setVisible(false);

        // Add a piece to the array for pieces of the player’s ship.
        this.playerPieces.push (pp);
      }
    }

    // Read the input.
    this.moveKeys = <{[key:string]:Phaser.Input.Keyboard.Key}> this.input.keyboard.addKeys
    ({
      'up':Phaser.Input.Keyboard.KeyCodes.W,
      'down':Phaser.Input.Keyboard.KeyCodes.S,
      'left':Phaser.Input.Keyboard.KeyCodes.A,
      'right':Phaser.Input.Keyboard.KeyCodes.D,
      'fire':Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Enables movement of player with WASD keys.
    this.input.keyboard.on('keydown_W', function (event:object) 
    {
      this.scene.player.setAccelerationY(-1000);
    });
    
    this.input.keyboard.on('keydown_S', function (event:object) 
    {
      this.scene.player.setAccelerationY(1000);
    });

    this.input.keyboard.on('keydown_A', function (event:object) 
    {
      this.scene.player.setAccelerationX(-1000);
    });
    
    this.input.keyboard.on('keydown_D', function (event:object) 
    {
      this.scene.player.setAccelerationX(1000);
    });           

    // Stops player acceleration on uppress of WASD keys.
    this.input.keyboard.on('keyup_W', function (event:object) 
    {
      if (this.scene.moveKeys['down'].isUp)
      this.scene.player.setAccelerationY(0);
    });
    
    this.input.keyboard.on('keyup_S', function (event: object) 
    {
      if (this.scene.moveKeys['up'].isUp)
      this.scene.player.setAccelerationY(0);
    });

    this.input.keyboard.on('keyup_A', function (event: object) 
    {
      if (this.scene.moveKeys['right'].isUp)
      this.scene.player.setAccelerationX(0);
    });
       
    this.input.keyboard.on('keyup_D', function (event: object) 
    {
      if (this.scene.moveKeys['left'].isUp)
      this.scene.player.setAccelerationX(0);
    });
      

    // BULLET GROUP
    this.lasers = this.physics.add.group
    ({
      classType: Bullet, 
      maxSize: 20,
      runChildUpdate: true
    });

    this.leftsideLasers = this.physics.add.group
    ({
      classType: LeftsideBullet,
      maxSize: 10,
      runChildUpdate: true
    }); 

    this.rightsideLasers = this.physics.add.group
    ({
      classType: RightsideBullet,
      maxSize: 10,
      runChildUpdate: true
    }); 

    this.backsideLasers = this.physics.add.group
    ({
      classType: BacksideBullet,
      maxSize: 10,
      runChildUpdate: true
    });                
      
    // Upgrades
    this.upgrades = this.physics.add.group
    ({
      classType: Upgrade,
      maxSize: 1,
      runChildUpdate: true
    });   

    // ENEMY GROUP
    this.enemies = this.physics.add.group
    ({
      classType: Enemy,
      maxSize: 50,
      runChildUpdate: true
    });

    // ASTEROID GROUP
    this.asteroids = this.physics.add.group
    ({
      classType: Asteroid,
      maxSize: 60,
      runChildUpdate: true
    });

    // Adding Colliders 
      
    // LASERS kill ENEMIES
    this.physics.add.collider(this.lasers, this.enemies, this.collideLaserEnemy, null, this); // last parameter is the context passed into the callback
    this.physics.add.collider(this.leftsideLasers, this.enemies, this.collideLaserEnemy, null, this);
    this.physics.add.collider(this.rightsideLasers, this.enemies, this.collideLaserEnemy, null, this);
    this.physics.add.collider(this.backsideLasers, this.enemies, this.collideLaserEnemy, null, this);

    this.physics.add.collider(this.lasers, this.asteroids, this.collideLaserAsteroid, null, this);
    this.physics.add.collider(this.leftsideLasers, this.asteroids, this.collideLaserAsteroid, null, this);
    this.physics.add.collider(this.rightsideLasers, this.asteroids, this.collideLaserAsteroid, null, this);
    this.physics.add.collider(this.backsideLasers, this.asteroids, this.collideLaserAsteroid, null, this);

    // PLAYER is killed by ENEMIES
    this.playerEnemyCollier = this.physics.add.collider(this.player, this.enemies, this.collidePlayerEnemy, null, this); 

    this.physics.add.collider(this.player, this.pickup, this.collidePickup, null, this); 

    this.physics.add.collider(this.player, this.heal, this.collideHeal, null, this); 

    this.physics.add.collider(this.player, this.shieldBooster, this.collideShieldBooster, null, this); 

    this.physics.add.collider(this.player, this.upgrades, this.collidePlayerPowerup, null, this); 

    this.physics.add.collider(this.player, this.asteroids, this.collidePlayerEnemy, null, this);

    // Customize the display of the interface
    
    // SCORE TEXT
    this.scoreText = this.add.text(5, 5, "Score: 0", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // Health text
    this.health = 3;
    this.healthText = this.add.text(5, 20, "Health:", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // Shield text
    this.shieldText = this.add.text(5, 35, "Shield energy: " + this.shieldEnergy + "%", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // Missed enemies text
    this.missedEnemiesText = this.add.text(5, 50, "Missed enemies: " + this.missedEnemies, { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // We call methods of initialization of the interface and the list of enemies.
    this.initializeHealthUI();
    this.InitializeEnemiesList();
  }

// Method for initializing the list of enemies.
InitializeEnemiesList()
{
  // List of types of opponents
  this.enemyHolders = [
    // Black
    new EnemyHolder ("blackEnemy", function (time:number, delta:number)
    {
      // Behavior.
      this.y += this.speed * delta;
      this.x += 1*this.speed*Math.sin(0.02*this.y)*delta;

      // Screen exit processing.
      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.scene.missedEnemies++;
        this.scene.missedEnemiesText.text = "Missed enemies: " + this.scene.missedEnemies;

        if (this.scene.missedEnemies >= 50)
        {
          this.scene.gameOver();
        }

        this.setActive(false);
        this.setVisible(false);
      }
       }),

    // Blue
    new EnemyHolder("blueEnemy", function(x:number, y:number)
    {
      this.y += this.speed * y;

      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.scene.missedEnemiesText.text = "Missed enemies: " + this.scene.missedEnemies;
        this.scene.missedEnemies++;

        if (this.scene.missedEnemies >= 50)
        {
          this.scene.gameOver();
        }

        this.setActive(false);
        this.setVisible(false);
      }
    }),

    // Green
    new EnemyHolder("greenEnemy", function(x: number, delta: number)
    {
      this.y += this.speed * delta;
      this.x += Phaser.Math.Between(-this.speed, this.speed)*delta;

      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.scene.missedEnemiesText.text = "Missed enemies: " + this.scene.missedEnemies;
        this.scene.missedEnemies++;

        if (this.scene.missedEnemies >= 50)
        {
          this.scene.gameOver();
        }

        this.setActive(false);
        this.setVisible(false);
      }
    }),
    ];
}

// The method updates the state of the game (spawn, state, choice of weapons, etc.).
update (time: number, delta: number) 
{
  // We count the time from the last spawn.
  this.lastSpawn -= delta;
  
  // If some time has passed and there are less than five active asteroids, then launch a new one.
  if (this.lastSpawn < 0) 
  {
    if (this.asteroids.countActive()<5)
    {
      (this.asteroids.get() as Asteroid).launch(Phaser.Math.Between(50,400),-50,1,0,0);
    }
  }
  
  // We place the shield in the right place and make sure that it follows the player.
  this.shield.setPosition(this.player.x, this.player.y);
  this.constrainVelocity(this.player, 100);
  
  // Offset shooting.
  const xGunOffset = 35;
  const yGunOffset = 20;

  // Switching the power of weapons.
  switch(this.gunType) 
  {
    case 0: 
    {
      // Check the press of the fire button. Number is the time until it can be pressed again.
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 500))
      {
        // Set up an ammunition object.
        let b: Bullet = this.lasers.get() as Bullet;
        
        // If successful, then perform the function of shooting them.
        if (b) 
        {
          b.fire(this.player.x, this.player.y, this.currentBullet);  
        }
      }
    break;
    }
         
    case 1: 
    {
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 300))
      {
        // This type of shot is two-phase. Phase 1 - one shot forward and to the sides.
        if (this.lastSideShooted % 2 == 0) 
        {
          let b: Bullet = this.lasers.get() as Bullet;
          let lb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
          let rb: RightsideBullet = this.rightsideLasers.get() as RightsideBullet;
          
          if (b) 
          {
            b.fire(this.player.x, this.player.y, this.currentBullet);  
          }

          if (lb) 
          {
            lb.fire(this.player.x, this.player.y, this.currentLeftsideBullet);  
          }

          if (rb) 
          {
            rb.fire(this.player.x, this.player.y, this.currentRightsideBullet);  
          }
        } 
        // Phase 2 - two forward shots.
        else 
        {
          let b: Bullet = this.lasers.get() as Bullet;
          
          if (b) 
          {
            b.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
          }

          // And we repeat, because it is a double shot. The launch site of the second shell is shifted.
          b = this.lasers.get() as Bullet;
          
          if (b) 
          {
            b.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
          }
        }
        
        // We fix that a similar shot was fired.
        this.lastSideShooted = (this.lastSideShooted + 1) % 2;
      } 
    break;
    }
    
    case 2: 
    {
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 250))
      {
        let b: Bullet = this.lasers.get() as Bullet;
        let lb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
        let rb: RightsideBullet = this.rightsideLasers.get() as RightsideBullet;
        let bb: BacksideBullet = this.backsideLasers.get() as BacksideBullet;
        
        if (b) 
        {
          b.fire(this.player.x, this.player.y, this.currentBullet);  
        }

        if (lb) 
        {
          lb.fire(this.player.x, this.player.y, this.currentLeftsideBullet);  
        }

        if (rb) 
        {
          rb.fire(this.player.x, this.player.y, this.currentRightsideBullet);  
        }

        if (bb) 
        {
          bb.fire(this.player.x, this.player.y, this.currentBacksideBullet);  
        }
        
        // And repeat two more times, because it is a triple shot. Places to launch the second and third shells are displaced.
        b = this.lasers.get() as Bullet;
        
        if (b) 
        {
          b.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
        }

        b = this.lasers.get() as Bullet;
        
        if (b) 
        {
          b.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet)
        }

        this.lastSideShooted = (this.lastSideShooted + 1) % 2;
      } 
    break;
    }
  }

  // We count the time from the last spawn upgrade.
  this.upgradeCooldown -= delta;

  // If the cooldown has passed.
  if (this.upgradeCooldown < 0)
  {
    // Configure an object of type upgrade.
    let u: Upgrade = this.upgrades.get() as Upgrade;
    
    // We place the upgrade on the stage and update the cooldown.
    if (u) 
    {
      u.spawn();
      this.upgradeCooldown += 10000;
    }
  }
  
  // If for some time nothing has spawn, spawn in different places.
  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    // this.lastSpawn += 1;
  }

  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    // this.lastSpawn += 1;
  }

  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    //this.lastSpawn += 1;
  }
  
  // We count the time from the last spawn of the selected item.
  this.lastPickupSpawn -= delta;

  // If there is no subject to be picked up on the stage and he did not spawn for a long time.
  if (!this.pickup.active && this.lastPickupSpawn < 0) 
  {
    // Then we place the object on the stage and update the "timer".
    this.pickup.setActive(true).setVisible(true);
    this.pickup.setVelocity(0,0);
    this.pickup.setAcceleration(0,0);
          
    let x: number = Phaser.Math.Between(50, 400);
    let y: number = Phaser.Math.Between(25, 200);

    this.pickup.setPosition(x, y);
    this.lastPickupSpawn += 10000;
  }

  // If the selected object is placed on the scene, then we force it to resize, eventually returning to the original, creating the effect of "blinking".
  if(this.pickup.active) 
  {
    let scale: number = Math.sin(time*0.005);
    this.pickup.setScale(0.5 + 0.1*scale, 0.5 + 0.1*scale);
  }

  // We count the time from the last spawn of extra life.
  this.lastHealSpawn -= delta;

  // If there is no extra life on the stage and she didn’t spawn for a long time.
  if (!this.heal.active && this.lastHealSpawn < 0) 
  {
    // Then we place the object on the stage and update the "timer".
    this.heal.setActive(true).setVisible(true);
    this.heal.setVelocity(0,0);
    this.heal.setAcceleration(0,0);
          
    let x: number = Phaser.Math.Between(50, 400);
    let y: number = Phaser.Math.Between(25, 200);

    this.heal.setPosition(x, y);
    this.lastHealSpawn += 10000;
  }

  // If extra life is placed on the stage, then we force it to resize, with time returning to the original, creating the effect of "blinking".
  if(this.heal.active) 
  {
    let scale: number = Math.sin(time*0.005);
    this.heal.setScale(0.6 + 0.05*scale, 0.6 + 0.05*scale);
  }

  // We count the time from the last spawn of the shield regenerator.
  this.lastShieldBoosterSpawn -= delta;

  // If there is no shield restorer on the stage and he did not spawn for a long time.
  if (!this.shieldBooster.active && this.lastShieldBoosterSpawn < 0) 
  {
    // Then we place the object on the stage and update the "timer".
    this.shieldBooster.setActive(true).setVisible(true);
    this.shieldBooster.setVelocity(0,0);
    this.shieldBooster.setAcceleration(0,0);
          
    let x: number = Phaser.Math.Between(50, 400);
    let y: number = Phaser.Math.Between(25, 200);

    this.shieldBooster.setPosition(x, y);
    this.lastShieldBoosterSpawn += 10000;
  }

  // If the shield is not active.
  if (this.shieldEnergy < 1)
  {
    this.shieldActive = false;
    this.shield.setActive(false).setVisible(false);
  }
  
  // Shield recovery after shutdown.
  if (!this.shieldActive && this.shieldEnergy >= 1) 
  {
    this.shieldActive = true;
    this.shield.setActive(true).setVisible(true);
  }

  // If the opponents did not spawn for a while.
  if (this.lastSpawn < 0) 
  {
    // SPAWN ENEMY

    // We create and launch the “Opponents” group.
    (this.enemies.get() as Enemy).launch(Phaser.Math.Between(50, 400), -50); 

    // Create an object of the "enemy" type and add it to the appropriate group.
    var enemy: Enemy = this.enemies.get() as Enemy;

    // We generate a random index.
    var randomIndex: integer = Phaser.Math.Between(0, this.enemyHolders.length-1);

    // We initialize a new object in the control structure.   
    enemy.init(this.enemyHolders[randomIndex]);

    // We place on the stage.
    enemy.launch(Phaser.Math.Between(50, 400), -50);

    // We increase the difficulty: the more score a player has, the faster the opponents.
    enemy.speed = Phaser.Math.GetSpeed (50 + (this.score / 5), 1);

    // Reset the spawn timer.
    this.lastSpawn += 1000;
  }
}

constrainVelocity(sprite: Phaser.Physics.Arcade.Sprite, maxVelocity: number)
{
  if (!sprite || !sprite.body)
  {
    return;
  }

  var angle, currVelocitySqr, vx, vy;
  vx = sprite.body.velocity.x;
  vy = sprite.body.velocity.y;
  currVelocitySqr = vx * vx + vy * vy;

  if (currVelocitySqr > maxVelocity * maxVelocity)
  {
    angle = Math.atan2(vy, vx);
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    sprite.body.velocity.x = vx;
    sprite.body.velocity.y = vy;
  }
}

// A method that calls an asterisk sprite at the specified coordinates to simulate an explosion.
addExplosionEffect (x: number, y: number)
{
    this.explosionEffect = this.physics.add.sprite(x, y, "effect").setScale(0.5, 0.5);
    this.explosionEffect.body.width *= 0.5;
    this.explosionEffect.body.height *= 0.5;
}

// Method removing sprite stars.
deleteExplosionEffect (effect: Phaser.Physics.Arcade.Sprite)
{
  if (!effect.active) return;
  effect.setActive(false).setVisible(false);
}

// Method for adding and adjusting the collider of a matching object (amplifier, asterisk).
collidePickup(player: Phaser.Physics.Arcade.Sprite, pickup: Phaser.Physics.Arcade.Sprite) 
{
  // If there is currently no player or object to be selected on the stage, we exit.
  if (!player.active) return;
  if (!pickup.active) return;

  // In a collision, deactivate the object.
  pickup.setActive(false).setVisible(false);
  
  // If the power of the weapon is not maximum, then go to the next.
  if (this.gunType < 2) 
  {
    this.gunType += 1;
  }
  // If the maximum, then increase the number of score.
  else 
  {
    this.score += 25;
    this.scoreText.text = "Score: " + this.score;
  }
}

// Method for adding and customizing the extra life collider.
collideHeal(player: Phaser.Physics.Arcade.Sprite, heal: Phaser.Physics.Arcade.Sprite)
{
  if (!player.active) return;
  if (!heal.active) return;

  heal.setActive(false).setVisible(false);
  
  // If the number of lives is less than the maximum number.
  if (this.health < 3) 
  {
    // Then add life to the player.
    this.health++;
    this.increaseHealth();
  }
  // If more, then increase the number of score.
  else 
  {
    this.score += 25;
    this.scoreText.text = "Score: " + this.score;
  }
}

// Method for adding and configuring the shield regenerator collider.
collideShieldBooster(player: Phaser.Physics.Arcade.Sprite, shieldBooster : Phaser.Physics.Arcade.Sprite)
{
  if (!player.active) return;
  if (!shieldBooster.active) return;

  shieldBooster.setActive(false).setVisible(false);
  
  // If the power of the shield is less than the maximum.
  if (this.shieldEnergy < 100) 
  {
    // Then we restore it.
    this.shieldUp();
  }
  // If the maximum, then add score.
  else 
  {
    this.score += 25;
    this.scoreText.text = "Score: " + this.score;
  }
}

// Method for adding and customizing a weapon switch collider (lightning).
collidePlayerPowerup(player: Phaser.Physics.Arcade.Sprite, upgrade: Upgrade)
{
  if (!player.active) return;
  if (!upgrade.active) return;

  upgrade.setActive(false).setVisible(false);

  // Switch weapons.
  this.currentBullet  = (this.currentBullet + 1) % 4;
  this.currentLeftsideBullet  = (this.currentLeftsideBullet + 1) % 4;
  this.currentRightsideBullet  = (this.currentRightsideBullet + 1) % 4;
  this.currentBacksideBullet  = (this.currentBacksideBullet + 1) % 4;

  if (this.currentBullet == BulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }

  if (this.currentLeftsideBullet == LeftsideBulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }

  if (this.currentRightsideBullet == RightsideBulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }

  if (this.currentBacksideBullet == BacksideBulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }
}

// Method for manually deactivating an adversary.
deactivateEnemy(enemy : Enemy)
{
  enemy.setActive(false).setVisible(false);
}

// A method that processes an enemy’s shell with a shell.
collideLaserEnemy (laser: Bullet, enemy: Enemy) 
{
  if (!laser.active) return;
  if (!enemy.active) return;

  // When hit by an enemy sprite, we impose a sprite of the explosion effect.
  this.addExplosionEffect(enemy.x, enemy.y);

  // Delayed deactivate the enemy object.
  this.time.delayedCall(80, this.deactivateEnemy, [enemy], this);
  
  // Delayed deactivate the effect of the explosion.
  this.time.delayedCall(100, this.deleteExplosionEffect, [this.explosionEffect], this);

  laser.setActive(false).setVisible(false);

  // Add a score and update the counter.
  this.score += 1;
  this.scoreText.text = "Score: " + this.score;
}

// A method that handles a collision between an enemy and a player.
collidePlayerEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) 
{
  if (!player.active) return;
  if (!enemy.active) return;

  enemy.setActive(false).setVisible(false);
  
  // If the shield is active.
  if (this.shieldActive) 
  {
    // Then we call the method that causes damage to it.
    this.shieldHit();
  } 
  // Otherwise.
  else 
  {
    // We take one life and update the interface.
    this.health--;
    this.decreaseHealth();
    
    // If the number of lives drops to zero.
    if (this.health <= 0) 
    {
      // Then we call the player exploding ship method.
      this.playerExplode();
    }
  }
}

// Method for exploding player ship.
playerExplode() 
{
  // We destroy the collider of the player’s ship and deactivate it as an object.
  this.playerEnemyCollier.destroy();
  this.player.setActive(false).setVisible(false);

  // We configure how many pieces a player’s ship sprite should fly into.
  let pw: number = 0.025 * this.player.width / this.pc;
  let ph: number = 0.025 * this.player.height / this.pc;
  let index: number = 0;
  
  // We loop through these pieces.
  for (let i: number = 0; i < this.pc; ++i) 
  {
    for (let j: number = 0; j < this.pc; ++j) 
    {
      // Each will be considered a separate object of the corresponding class with its own index.
      let pp: Phaser.Physics.Arcade.Sprite = this.playerPieces[index];  
      
      // Activate the object.      
      pp.setActive(true).setVisible(true);

      // Set up a starting position.
      pp.setPosition(this.player.x + i*pw, this.player.y + j*ph);

      // We get a random speed along the axes.
      let ix: number = Phaser.Math.FloatBetween(100, 300) - 200;
      let iy: number = Phaser.Math.FloatBetween(100, 300) - 200;           
      pp.setVelocity(ix, iy);

      // We set random acceleration.
      pp.setAcceleration(-ix / Phaser.Math.FloatBetween(2, 4), -iy / Phaser.Math.FloatBetween(2, 4));
      
      // Increase the index.
      index++;
    }
  }
   // After a few seconds, we call the end of the game method.
   this.time.delayedCall(2500, this.gameOver, [], this);
}

// Method processing the end of the game.
gameOver() 
{
  // We roll back the variables to the starting values and update the interface.
  this.score = 0;
  this.scoreText.text = "Score: " + this.score;

  this.shieldEnergy = 100;
  this.shieldText.text = "Shield energy: " + this.shieldEnergy + "%";

  this.missedEnemies = 0;
  this.missedEnemiesText.text = "Missed enemies: " + this.missedEnemies;

  // Reboot the current scene.
  this.scene.restart();
}

// Method for initializing a health indicator.
initializeHealthUI() 
{
  // We create an array for sprites, which are indicators.
  this.healthSprites = [];
  
  // We go through the cycle in terms of the number of lives.
  for (let i: number = 0; i < this.health; i ++) 
  {
    // For each, add a sprite to the selected location.
    this.healthSprites[i] = this.physics.add.sprite(65 + i * 20, 28, "life").setScale(0.5,0.5);
  }
}

// Method for updating health indicators (decrease).
decreaseHealth() 
{
  // Delete the sprite indicator with the index of the current number of lives.
  this.healthSprites[this.health].destroy();
}

// Method for updating health indicators (increase).
increaseHealth()
{
  // We create an array for sprites, which are indicators.
  for (let i: number = 0; i < this.health; i ++) 
  {
    this.healthSprites[i].destroy();
  }
  
  // We go through the cycle in terms of the number of lives.
  for (let i: number = 0; i < this.health; i ++) 
  {
    // For each, add a sprite to the selected location.
    this.healthSprites[i] = this.physics.add.sprite(65 + i * 20, 28, "life").setScale(0.5,0.5);
  }
}

// A collision method for asteroid and shell.
collideLaserAsteroid(laser: Bullet, asteroid: Asteroid)
{
  if (!laser.active) return;
  if (!asteroid.active) return;

  laser.setActive(false).setVisible(false);

  this.score += 1;
  this.scoreText.text = "Score: " + this.score;

  // If the size of the asteroid is more than 3.
  if (asteroid.size >= 3)
  {
    // Then just deactivate this object.
    asteroid.setActive(false).setVisible(false);
  }
  // Otherwise.
  else
  {
    // Increase its size by 1.
    asteroid.size+=1;

    // We create another similar asteroid.      
    var t: number = Phaser.Math.Between(-50,50);
    var t2: number = Phaser.Math.Between(-50,50);
    asteroid.setSprite();
    (this.asteroids.get() as Asteroid).launch(asteroid.X,asteroid.Y,asteroid.size,t,Phaser.Math.Between(-50,50));
         
    asteroid.xdif=-t;
    asteroid.ydif=Phaser.Math.Between(-50,50);
  }
}

 // A method that deals damage to a shield.
 shieldHit() 
 {
   // If the shield has energy.
   if (this.shieldEnergy >= 10)
   {
      // We deal shield energy damage.
      this.shieldEnergy -= 10;
      this.shieldText.text = "Shield energy: " + this.shieldEnergy + "%";
   }
 }

 // The method of processing energy recovery shield.
 shieldUp() 
 {
   // Restore the energy of the shield.
   this.shieldEnergy += 10;
   this.shieldText.text = "Shield energy: " + this.shieldEnergy + "%";
 }
}