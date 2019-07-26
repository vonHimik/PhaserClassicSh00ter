export class Res extends Phaser.Scene 
{
  // Конструктор объекта Ресурсы.
  constructor()
  {
    super ("Res");
  }

  // Метод для предзагрузки ресурсов (изображений).
  preload() 
  {
    console.log("Res.preload()");

    // Устанавливаем базовую ссылку для загрузки.
    this.load.setBaseURL("https://cdn.jsdelivr.net/gh/kefik/kenney/Shooter/");
    
    // Загружаем указанные изображения (по адресу), присваивая им названия.
    this.load.image("playership1", "playerShip1_blue.png");
    this.load.image("bullet", "lasers/laserBlue01.png");
    this.load.image("broadsideBullet", "lasers/laserGreen15.png");
    this.load.image("enemy", "enemies/enemyBlack1.png");
    this.load.image("star", "powerups/star_gold.png");
    this.load.image("life", "ui/playerLife1_blue.png");
    this.load.image("shield1", "effects/shield1.png");
    this.load.image("background", "effects/star2.png");
    this.load.image("fastBullet", "lasers/laserRed01.png");
    this.load.image("wobblyBullet", "lasers/laserRed01.png");
    this.load.image("powerup", "powerups/bolt_gold.png");
    this.load.image("blackEnemy", "enemies/enemyBlack1.png");
    this.load.image("blueEnemy", "enemies/enemyBlue1.png");
    this.load.image("greenEnemy", "enemies/enemyGreen1.png");
    this.load.image("redEnemy", "enemies/enemyRed1.png");
    this.load.image("asteroidBig", "meteors/meteorBrown_big1.png");
    this.load.image("asteroidMed", "meteors/meteorBrown_med1.png");
    this.load.image("asteroidSmall", "meteors/meteorBrown_small1.png");
  }

  // Метод закрывающий текущую сцену и переходящий к главной сцене.
  create() 
  {
    console.log("Res.create()");
    
    this.scene.start ("Play");
  }
}