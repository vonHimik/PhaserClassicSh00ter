export class Upgrade extends Phaser.Physics.Arcade.Sprite 
{
  // Конструктор объекта Апгрейд.
  constructor (scene: Phaser.Scene)
  {
    // Размещаем его на сцене.
    super (scene, 0, 0, "upgrade");
  }
  
  // Метод для спавна объекта Апгрейд (спрайт, физика, место появления).
  spawn() 
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'powerup');
    this.scene.physics.add.existing(this);
    this.setPosition(Phaser.Math.Between(20,450), Phaser.Math.Between(20,600));

    this.setActive(true);
    this.setVisible(true);
  }

  // Метод деактивирующий объект Апгрейд при его выходе за границы экрана.
  update (time: number, delta: number) 
  {
    if (this.x > -5 && this.x < 485 && this.y > -5 && this.y < 645) return;

    this.setActive(false);
    this.setVisible(false);
  }
}