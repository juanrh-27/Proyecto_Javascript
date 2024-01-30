let config = {
    type: Phaser.AUTO,// llamando la librería
    width: 1100,//ancho 
    height: 900,//alto
// fisicas para la gravedad del personaje y los objetos
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Desactivamos la gravedad en el eje Y
            debug: false
        }
    },
    scene: {
        preload: preload,//inicializamos las funciones
        create: create,
        update: update,
    }
};

let score = 0;// contador
let scoreText;// texto del contador
let gameOver = false;// finalizar el juego 

let game = new Phaser.Game(config);//conectado a la configuracion del phaser

let player;//inicializando variable del jugador
let cursors;//inicializando variable de controles

function preload() {
// Carga de imágenes y otros recursos
    this.load.image('fondo', 'img/fondodos.jpg');
    this.load.image('suelo', 'img/suelo.png');
    this.load.image('plataforma1', 'img/plataforma 1.png'),
    this.load.image('plataforma2', 'img/plataforma 2.png'),
    this.load.image('plataforma3', 'img/plataforma 3.png'),
    this.load.image('plataforma4', 'img/plataforma 4.png'),
    this.load.image('estrella', 'img/estrella.png'),
    this.load.image('bomba', 'img/bomba.png'),
    this.load.spritesheet('hombre', 'img/hombree.png', { frameWidth: 41, frameHeight: 53 });
}

function create() {
// Creación de escenario y objetos
    this.add.image(550, 450, 'fondo').setName('fondo');

    platforms = this.physics.add.staticGroup();

    platforms.create(550, 852, 'suelo').refreshBody();
    platforms.create(180, 270, 'plataforma1');
    platforms.create(951, 140, 'plataforma2');
    platforms.create(650, 180, 'plataforma3');
    platforms.create(840, 538, 'plataforma4');

//creacion de personaje
    player = this.physics.add.sprite(120, 450, 'hombre');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);
//direcciones del personaje
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hombre', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'hombre', frame: 0 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hombre', { start: 12, end: 15 }),
        frameRate: 10,
        repeat: -1
    });
    
//colisión de personaje con las plataformas 

    this.physics.add.collider(player, platforms);
//se le agrega un input para que lea la dirección que se oprime    
    cursors = this.input.keyboard.createCursorKeys();

//conteo de las estrellas en el mapa
    estrellas = this.physics.add.group({
        key: 'estrella',
        repeat: 11,
        setXY: {x: 65, y: 0, stepX: 90}
    });
//rebote de las estrellas
    estrellas.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.6));
    });
//colisión de objetos
    this.physics.add.collider(estrellas, platforms);
//el jugador pueda recoger las estrellas
    this.physics.add.overlap(player, estrellas, recogeestrellas, null, true);
//al contador se le indica un lugar para visualizar
    scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#00'});
//se le agregan físicas a la bomba
    bombs = this.physics.add.group();
//colisión de la bomba 
    this.physics.add.collider(bombs, platforms);
//colisión de la bomba con el jugador
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}
//movimiento del personaje
function update() {

    if(gameOver) {
        return
    }
    
    player.setVelocityX(0); // para que no deslice el personaje
    if(cursors.left.isDown) {
        player.setGravityX(-160);// movimiento hacia la izquierda
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setGravityX(160);// movimiento hacia la derecha
        player.anims.play('right', true);
    } else {
        player.setGravityX(0);
        player.anims.play('turn', true);//movimiento estatico
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-460); //salto
    }
}
// función para que el personaje recoja las
function recogeestrellas(player, estrella) {
    estrella.disableBody(true, true);

    score += 10;// por cada estrella recogida se le sume al contador 10 puntos
    scoreText.setText('Score: '+ score);

    if(estrellas.countActive(true) === 0) {
        estrellas.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    
//indicando las direcciones de la bomba, rebote y velocidad 
    let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400); 
    let bomb = bombs.create(x, 16, 'bomba');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}


//función para cuando el jugador toca la bomba
function hitBomb(player, bomb) {
    this.physics.pause();//física para que cuando toque la bomba no se mueva el jugador 

    player.setTint(0xff0000);//color del personaje cuando lo toca

    player.anims.play('turn');//se establece una dirección

    gameOver = true;//para finalizar el juego
    
}
