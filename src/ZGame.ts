import { Res } from "./Res";
import { Play } from "./Play";

export var gameConfig = {
        type: Phaser.AUTO,
        width: 480,
        height: 640,
        backgroundColor: 0x000000,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: [Res, Play],        
    };