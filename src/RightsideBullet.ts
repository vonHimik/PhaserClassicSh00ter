// Список типов боеприпасов.
export enum RightsideBulletType 
{
   Default,
   Wobbly,
   Mega,
   Fast,
}

export class RightsideBullet extends Phaser.Physics.Arcade.Sprite 
{
  speed: number;
  rightsideBulletType: RightsideBulletType;
  totalTime: number = 0;

  // Число снарядов за залп.
  shotMultiply: number = 1;

  // Конструктор объекта Снаряд.
  constructor (scene: Phaser.Scene)
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "bullet");
    
    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (300, 1);
  }

  // Метод для выстрела, устанаваливаем характеристики снаряда.
  fire (x: number, y: number, rightsideBulletType: RightsideBulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.rightsideBulletType = rightsideBulletType;     
    
    // Переключаем тип снаряда.
    switch (rightsideBulletType)
    {
      case RightsideBulletType.Default:
      this.rightsideDefaultBullet (x,y);
      break;

      case RightsideBulletType.Fast:
      this.rightsideFastBullet (x,y);
      break;

      case RightsideBulletType.Wobbly:
      this.rightsideWobblyBullet (x,y);
      break;

      case RightsideBulletType.Mega:
      this.rightsideDefaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // Вызываем на сцену снаряд базового типа, по координатам, добавляем физику.
  rightsideDefaultBullet (x: number, y: number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'broadsideBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }

  // Вызываем на сцену снаряд быстрого типа, по координатам, модифицируем скорость, добавляем физику.
  rightsideFastBullet (x: number, y: number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }
  
  // Вызываем на сцену снаряд вихляющего типа, по координатам, модифицируем скорость, добавляем физику.
  rightsideWobblyBullet (x: number, y: number) 
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }

  // Метод для обновления снаряда - перермещение.
  update (time: number, delta: number)
  {
    // По x.
    this.x += this.speed * delta;
    this.totalTime += delta;

    // Если тип снаряда - обычный.
    if (this.rightsideBulletType == RightsideBulletType.Default)
    {
      // Поворачиваем.
      this.rotation = 1.55; 
    }
    
    // Если тип снаряда - вихляющий.
    if (this.rightsideBulletType == RightsideBulletType.Wobbly)
    {
      // Поворачиваем.
      this.rotation = 1.55; 

      // По y.
      this.y += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // Если тип снаряда - мега.
    if (this.rightsideBulletType == RightsideBulletType.Mega)
    {
      // Меняем размеры.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Деактивируем, если улетел за сцену.
    if (this.x >= 500)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}