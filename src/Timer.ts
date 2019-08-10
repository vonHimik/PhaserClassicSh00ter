exportclass Timer 
{
    constructor (public counter = 3) 
    {

        let intervalId = setInterval(
          () => 
        {
            this.counter = this.counter - 1;
            console.log(this.counter)
            if(this.counter === 0) clearInterval(intervalId)
        }
        , 1000)
    }
}