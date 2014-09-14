var game = new Phaser.Game(320, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('sky', 'assets/sky.png'); 
    game.load.image('sky2', 'assets/sky2.png'); 
    game.load.image('sky3', 'assets/sky3.png'); 
    game.load.image('ground', 'assets/ground.png'); 
    game.load.image('cloud', 'assets/cloud.png'); 
    game.load.image('bee', 'assets/bee.png'); 

    game.load.spritesheet('grass', 'assets/grass.png', 208, 73);
    game.load.spritesheet('rabbit', 'assets/rabbit_jump2.png', 87, 144);

    // game.load.audio('background', ['assets/audio/background.mp3', 'assets/audio/background.ogg']);
    // game.load.audio('jump', 'assets/audio/jump.mp3');


}

var player;
var ground;
var clouds;
var bees;

var backgroundMusic;
var timer;

var scoreText;
var bestScoreText;
var score = 0;

var firstBounceVelocity = -400;
var standardBounce = 200
var firstBounce = true;
this.timesBounced = 1;
this.rabbitY = 1;
this.upperBound = 2356;
this.rising = false;
var previousBest = 0;

var now = 0;
var then = 0;




function create() {


    //draw sky + set world boundaries
    game.add.sprite(-1,2057, 'sky');
    game.add.sprite(-1,1500, 'sky2');
    game.add.sprite(-1,900, 'sky3');
    game.world.setBounds(0, 0, 50, 2800);



    //draw cloud group
    clouds = game.add.group();
    clouds.enableBody = true;
    clouds.physicsBodyType = Phaser.Physics.ARCADE;


    for (var y = 0; y < 3; y++){
        
        var i;
        for (i = 0; i < clouds.length; i++) {
            var xLocation = clouds.getAt(i).body.x = Math.random()*1000
        }

        var cloud = clouds.create (xLocation, 2100 + y * 80, 'cloud');
        cloud.checkWorldBounds = true;
        cloud.events.onOutOfBounds.add(cloudLoop, this);

        var rand = Math.random()*(1 - 0.25) + 0.25
        cloud.scale.setTo(rand, rand);
        cloud.body.velocity.x = rand * 10
    }



    //grass sprite animation (need 2 to cover width?)
    grass = game.add.sprite(0, 2535, 'grass');
    grass.animations.add('anim', [1,2], 2, true);
    grass.animations.play('anim');

    grass2 = game.add.sprite(200, 2535, 'grass');
    grass2.animations.add('anim', [1,2], 2, true);
    grass2.animations.play('anim');


    //bee sprite animation
    bees = game.add.group();
    bees.enableBody = true;
    bees.physicsBodyType = Phaser.Physics.ARCADE;

    var bee = bees.create (0, 2500, 'bee');
    bee.checkWorldBounds = true;
    bee.events.onOutOfBounds.add(beeLoop, this);
    bee.scale.setTo(0.2, 0.2);
    bee.body.velocity.x = 300
 

    //draw ground and initiate collision 
    ground = game.add.sprite(0, game.world.height - 200, 'ground');
    game.physics.arcade.enable(ground);
    ground.scale.setTo(1,1);
    ground.body.immovable = true;



    //draw rabbit and initiate collision
    player = game.add.sprite(115, game.world.height - 340, 'rabbit');
    game.physics.arcade.enable(player);
    //player.body.bounce.y = 0.3;
    player.body.gravity.y = 1000;

    

 // =================== ESSENTIALS


    game.camera.follow(player);

    // jump on click
    this.click = game.input.onDown;
    this.click.add(jump);

    // score text
    scoreText = game.add.text(32, 32,'' + score, { fontSize: '92px', fill: 'white' });
    bestScoreText = game.add.text(260, 32,'' + localStorage.getItem("previousBest"), { fontSize: '92px', fill: 'red' });
    bestScoreText.fixedToCamera = true;
    scoreText.fixedToCamera = true;   
    
    // sound
    backgroundMusic = game.add.audio('background',1,true);
    backgroundMusic.play('',0,1,true);

    jumpSound = game.add.audio('jump');

}



function update() {

    game.physics.arcade.collide(player, ground);

    //score system
    if((2456 - player.y)> score){
        scoreText.text = (score /10).toFixed(0);
    }

    if((2456 - player.y)> previousBest){
        previousBest = score
        bestScoreText.text = (score /10).toFixed(0);
    }

    score = 2456 - player.y;

    
    if (score > localStorage.getItem("previousBest")) {
            localStorage.setItem("previousBest", score);

    }





    if(player.y == 2456){
        timesBounced = 1;
        scoreText.text = 0;
        firstBounce = true;
    }

    //detect rabbit movement
    now = player.y;

    if(now > then){ 
        player.animations.add('fall', [2], 5, true);
        rising = false;
    }

    else if (now < then){
        player.animations.add('jump', [1], 5, true);
        rising = true;
    }

    else {
        player.animations.add('stand', [0], 5, true);
        rising = false;
    }

    then = now

}


//========= Custom Functions ==================//


function jump() {  
    
    //main rabbit physics
    this.rabbitY = player.y;

    if (player.y >= this.upperBound && player.y <= 2456){

        var distanceToGround = player.y - 2456;

        this.timesBounced = this.timesBounced + 1;

        if(this.firstBounce == true){
            var rabbitVelocity = this.firstBounceVelocity;
            this.firstBounce = false;
            this.upperBound = 2356;

        } else {
            if(this.timesBounced > 1){
                this.upperBound = this.upperBound - 10;
                var velocity = 500 + distanceToGround - 300;
                var rabbitVelocity = this.currentVelocity - velocity;
            }
            
        }

        this.currentVelocity = rabbitVelocity;

        if(this.rising == false){
            player.body.velocity.y = rabbitVelocity;
        }

    } else {

        this.timesBounced = 1;
        this.firstBounce = true;
        console.log(this.timesBounced + " out of bounds");
    }

    //Jumping Sound
    jumpSound.play();


}


function cloudLoop(cloud) {

    //  Move the cloud to the other side of the screen
    cloud.reset(-100, cloud.y);

    //  Reset velocity/size
    var rand = Math.random()*(1 - 0.25) + 0.25
    cloud.scale.setTo(rand, rand);
    cloud.body.velocity.x = rand * 10

}

function beeLoop(bee) {
     
    //  Move the bee to the other side of the screen
    bee.reset(-10, bee.y);
    bee.body.velocity.x = 300

}


function render() {

    //game.debug.body(player);
    //game.debug.spriteInfo(player, 62, 32);

}