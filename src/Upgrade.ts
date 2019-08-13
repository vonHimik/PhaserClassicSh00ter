export class Upgrade extends Phaser.Physics.Arcade.Sprite 
{
  constructor (scene: Phaser.Scene)
  {
    // We place it on the stage.
    super (scene, 0, 0, "upgrade");
  }
  
  // Method for the spawn of the Upgrade object (sprite, physics, place of occurrence).
  spawn() 
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'powerup');
    this.scene.physics.add.existing(this);
    this.setPosition(Phaser.Math.Between(20,450), Phaser.Math.Between(20,600));

    this.setActive(true);
    this.setVisible(true);
  }

  // Method The deactivating object Upgrade when it goes beyond the boundaries of the screen.
  update (time: number, delta: number) 
  {
    if (this.x > -5 && this.x < 485 && this.y > -5 && this.y < 645) return;

    this.setActive(false);
    this.setVisible(false);
  }
}