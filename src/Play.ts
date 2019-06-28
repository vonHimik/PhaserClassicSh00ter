import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
    
export class Play extends Phaser.Scene 
{

    player: Phaser.Physics.Arcade.Sprite;

    moveKeys: {[key:string] : Phaser.Input.Keyboard.Key };

    lasers: Phaser.Physics.Arcade.Group;

    enemies: Phaser.Physics.Arcade.Group;

    lastSpawn: number = 0;

    score: number = 0;

    scoreText: Phaser.GameObjects.Text;

    constructor() 
    {
        super("Play");
    }

    create() 
    {
        console.log("Play.create()");

        this.player = this.physics.add.sprite(320, 500, "playership1").setScale(0.5, 0.5);
        this.player.body.collideWorldBounds=true;
        this.player.body.width *= 0.5;
        this.player.body.height *= 0.5;

        this.moveKeys = <{[key:string] : Phaser.Input.Keyboard.Key }> this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'fire': Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Enables movement of player with WASD keys
        this.input.keyboard.on('keydown_W', function (event: object) 
        {
            this.scene.player.setAccelerationY(-800);
        });
        this.input.keyboard.on('keydown_S', function (event: object) 
        {
            this.scene.player.setAccelerationY(800);
        });
        this.input.keyboard.on('keydown_A', function (event: object) 
        {
            this.scene.player.setAccelerationX(-800);
        });
        this.input.keyboard.on('keydown_D', function (event: object) 
        {
            this.scene.player.setAccelerationX(800);
        });            

        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', function (event: object) 
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
        this.lasers = this.physics.add.group({
            classType: Bullet,
            maxSize: 20,
            runChildUpdate: true
        });            

        // ENEMY GROUP
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 50,
            runChildUpdate: true
        });
        
        // LASERS kill ENEMIES
        this.physics.add.collider(this.lasers, this.enemies, this.collideLaserEnemy, null, this); // last parameter is the context passed into the callback

        // PLAYER is killed by ENEMIES
        this.physics.add.collider(this.player, this.enemies, this.collidePlayerEnemy, null, this); // last parameter is the context passed into the callback

        // SCORE TEXT
        this.scoreText = this.add.text(5, 5, "Score: 0", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);
    }

    update(time: number, delta: number) 
    {
        this.constrainVelocity(this.player, 100);

        if (this.input.keyboard.checkDown(this.moveKeys['fire'], 300))
        {
            let b: Bullet = this.lasers.get() as Bullet;
            if (b) 
            {
                b.fire(this.player.x, this.player.y);                
            } 
        }

        this.lastSpawn -= delta;

        if (this.lastSpawn < 0) 
        {
            // SPAWN ENEMY
            let e : Enemy = this.enemies.get() as Enemy;
            if (e) 
            { 
              e.launch(Phaser.Math.Between(50, 400), -50);     
            }
            this.lastSpawn += 1000;
        }
    }

    constrainVelocity(sprite: Phaser.Physics.Arcade.Sprite, maxVelocity: number)
    {
        if (!sprite || !sprite.body)
        return;

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

    collideLaserEnemy(laser: Bullet, enemy: Enemy) 
    { 
        if (!laser.active) return;
        if (!enemy.active) return;

        laser.setActive(false).setVisible(false);
        enemy.setActive(false).setVisible(false);

        this.score += 1;
        this.scoreText.text = "Score: " + this.score;
    }

    collidePlayerEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) 
    { 
        if (!player.active) return;
        if (!enemy.active) return;

        player.setActive(false).setVisible(false);
        enemy.setActive(false).setVisible(false);

        this.time.delayedCall(500, this.gameOver, [], this);
    }

    gameOver() 
    {
        this.scene.restart();
    }
}