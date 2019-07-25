// Список типов боеприпасов.
export enum BroadsideBulletType 
{
   None,
   Wobbly, // Вихляющие
   Mega,
   Fast,
}

export class BroadsideBullet extends Phaser.Physics.Arcade.Sprite 
{
  speed : number;
  broadsideBulletType : BroadsideBulletType;
  totalTime : number = 0;

  // Число снарядов за залп.
  shotMultiply : number = 1;

  // Конструктор объекта Снаряд.
  constructor (scene : Phaser.Scene)
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "star");
    
    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (300, 1);
  }

  // Метод для выстрела, устанаваливаем характеристики снаряда.
  fire (x:number, y:number, broadsideBulletType : BroadsideBulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.broadsideBulletType = broadsideBulletType;     
    
    // Переключаем тип снаряда.
    switch (broadsideBulletType)
    {
      case BroadsideBulletType.None:
      //this.defaultBullet (x,y);
      break;

      case BroadsideBulletType.Fast:
      this.broadsideFastBullet (x,y);
      break;

      case BroadsideBulletType.Wobbly:
      this.broadsideWobblyBullet (x,y);
      break;

      case BroadsideBulletType.Mega:
      this.broadsideDefaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // Вызываем на сцену снаряд базового типа, по координатам, добавляем физику.
  broadsideDefaultBullet (x:number, y:number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'star');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // Вызываем на сцену снаряд быстрого типа, по координатам, модифицируем скорость, добавляем физику.
  broadsideFastBullet (x:number, y:number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'star');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }
  
  // Вызываем на сцену снаряд вихляющего типа, по координатам, модифицируем скорость, добавляем физику.
  broadsideWobblyBullet (x:number, y:number)
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'star');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // Метод для обновления снаряда - перермещение.
  update (time:number, delta:number)
  {
    // По x.
    this.x -= this.speed * delta;
    this.totalTime += delta;
    
    // Если тип снаряда - вихляющий.
    if (this.broadsideBulletType == BroadsideBulletType.Wobbly)
    {
      // По y.
      this.y += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // Если тип снаряда - мега.
    if (this.broadsideBulletType == BroadsideBulletType.Mega)
    {
      // Меняем размеры.
      this.scaleX = 3 * Math.sin (this.totalTime/100);
      this.scaleY = 3 * Math.sin (this.totalTime/100);
    }

    // Деактивируем, если улетел за сцену.
    if (this.x < -50)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}