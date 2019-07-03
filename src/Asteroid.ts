export class Asteroid extends Phaser.Physics.Arcade.Sprite 
{
  speed:number;
  size:number;

  // Конcтруктор объекта астероид.
  constructor (scene:Phaser.Scene) 
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "asteroid");

    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (50, 1);
  }

  xdif:number;
  ydif:number;

  // Метод для запуска астероида, настройка стартовых параметров.
  launch (x:number, y:number, size:number, xd:number, yd:number) : Asteroid 
  {
    this.size = size;
    this.setSprite ();
    this.xdif = xd;
    this.ydif = yd;
    this.setScale (0.3, 0.3);
    this.scene.physics.add.existing (this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.setPosition (x, y);
    this.setActive (true);
    this.setVisible (true);
    return this;
  }

  // Метод для обновления состояния астероида (перемещение, вылет за сцену).
  update (time:number, delta:number) 
  {
    // Обновляем координаты.
    var t:number = this.ydif * this.speed*delta/100;
    this.y += this.speed * delta +t/2;
    this.x += this.xdif * this.speed*delta/100;
    
    // Если вылетел за сцену, деактивируем.
    if (this.y > Number (this.scene.game.config.height) + 50)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }

  // Метод для получения координаты У.
  get Y():number
  {
    return this.y;
  }
  // Метод для получения координаты Х.
  get X():number
  {
    return this.x;
  }

  // Метод для установки спрайта астероиду, в зависимости от его размера (большой,       средний, малый).
  setSprite():void
  {
    if (this.size == 1)
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y,'asteroidBig');
    }
    else if (this.size == 2)
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, 'asteroidMed');
    }
    else
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, 'asteroidSmall');
    }
  }
}