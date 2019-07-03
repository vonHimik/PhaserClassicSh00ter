export class Upgrade extends Phaser.Physics.Arcade.Sprite 
{
  constructor( scene: Phaser.Scene )
  {
    super(scene, 0, 0, "upgrade");
  }
  
  spawn() 
  {
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'powerup');
    this.scene.physics.add.existing(this);
    this.setPosition(Phaser.Math.Between(20,450), Phaser.Math.Between(20,600));
    this.setActive(true);
    this.setVisible(true);
  }

  defaultBullet(x: number, y:number)
  {
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'bullet');
    this.scene.physics.add.existing(this);
    this.setPosition(x, y - 45);
  }

  update(time: number, delta: number) 
  {
    if (this.x > -5 && this.x < 485 && this.y > -5 && this.y < 645) return;
    this.setActive(false);
    this.setVisible(false);
  }
  }