export class Background extends Phaser.Physics.Arcade.Sprite 
{
  speed:number;

  // Конструктор объекта Фон.
  constructor (scene:Phaser.Scene) 
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "background");

    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (Math.random() * 30 + 20, 1);         
  }

  // Метод для запуска фона, настройка стартовых параметров.
  launch (x:number, y:number) : Background 
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'background');
    this.setScale (this.speed * 10, this.speed * 10);
    this.scene.physics.add.existing (this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.alpha *= (10 * this.speed);
    this.setTintFill (0x333399);
    this.setPosition (x, y);
    this.setActive (true);
    this.setVisible (true);
    return this;
  }

  // Метод для обновления состояния фона (перемещение, вылет за сцену).
  update (time:number, delta:number) 
  {
    // Обновляем координаты.
    this.y += this.speed * delta;
    
    // Если вылетел за сцену, деактивируем.
    if (this.y > Number (this.scene.game.config.height) + 50)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}