import { EnemyHolder } from "./EnemyHolder";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  speed: number;
  spriteName: string = null;

  updateFunction: (x: number, y: number) => void = null;

  constructor(scene: Phaser.Scene) {
    // Set the scene (current scene, x and y coordinates), texture.
    super(scene, 0, 0, "enemy");

    // Set the speed (pixels per frame).
    this.speed = Phaser.Math.GetSpeed(50, 1);
  }

  // Method to launch the enemy.
  launch(x: number, y: number): Enemy 
  {
    // Install the sprite.
    if (this.spriteName != null) 
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, this.spriteName);
    }
    else 
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'blackEnemy');
    }

    this.setScale(0.3, 0.3);
    this.scene.physics.add.existing(this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.body.setCircle(20);
    this.setPosition(x, y);
    this.setVelocity(0, 0).setAcceleration(0, 0);
    this.setActive(true);
    this.setVisible(true);
    return this;
  }

  // The method for updating the state of the enemy is moving, leaving the screen.
  update(time: number, delta: number) 
  {
    if (this.updateFunction == null) 
    {
      // Apply the default update
      this.y += this.speed * delta;

      if (this.y > Number(this.scene.game.config.height) + 50) {
        this.setActive(false);
        this.setVisible(false);
      }
    }
    else 
    {
      // Apply the custom update
      this.updateFunction(time, delta);
    }
  }

  // Method for initializing sprite and update function.
  init(holder: EnemyHolder) 
  {
    this.spriteName = holder.spriteName;
    this.updateFunction = holder.updateFunction;
  }
}