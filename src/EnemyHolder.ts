export class EnemyHolder 
{
  // {Honza}
  // Enemy variables to customise them and their beavior

  // Имя спрайта.
  spriteName: string = null;

  // Функция обновления.
  updateFunction: (x: number, y: number) => void = null;

  // Конструктор объекта EnemyHolder.
  constructor (_name: string, _updateFunction: (x: number, y: number) => void) 
  {
    this.spriteName = _name;
    this.updateFunction = _updateFunction;
  }
}