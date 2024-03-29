namespace SpriteKind {
    export const rock = SpriteKind.create()
    export const player_projectile = SpriteKind.create()
}

//  
//  sprites
let me = sprites.create(assets.image`me`, SpriteKind.Player)
//  controller.move_sprite(me) # remove
me.setPosition(20, 20)
me.setStayInScreen(true)
let skull = sprites.create(assets.image`flaming skull`, SpriteKind.Enemy)
let boss_health = statusbars.create(20, 4, StatusBarKind.Health)
// 
boss_health.attachToSprite(skull)
// 
animation.runImageAnimation(skull, assets.animation`flaming`, 150, true)
animation.runMovementAnimation(skull, animation.animationPresets(animation.bobbing), 4000, true)
//  setup
scene.setBackgroundImage(assets.image`background`)
spriteutils.setConsoleOverlay(true)
//  variables
let is_moving = false
let acceleration = 8
let deceleration = 0.9
let blocking = false
// 
function fire() {
    for (let i = 0; i < randint(1, 3); i++) {
        timer.background(function spawn_rock() {
            let rock: Sprite;
            let anim: Image[];
            let frame_len: number;
            rock = sprites.create(image.create(16, 16), SpriteKind.rock)
            spriteutils.placeAngleFrom(rock, randint(0, Math.PI * 2), 35, spriteutils.pos(80, 60))
            anim = assets.animation`entry`
            frame_len = 100
            scene.cameraShake(4, anim.length * frame_len)
            animation.runImageAnimation(rock, anim, frame_len, false)
            pause(randint(2500, 8000))
            anim.reverse()
            animation.runImageAnimation(rock, anim, frame_len, false)
            rock.lifespan = frame_len * anim.length
        })
    }
    pause(500)
    music.play(music.melodyPlayable(music.buzzer), music.PlaybackMode.UntilDone)
    if (randint(1, 2) == 2) {
        generate_projectiles(50)
    } else {
        generate_projectiles(0)
    }
    
    timer.after(randint(3500, 5000), fire)
}

timer.after(randint(3500, 5000), fire)
function generate_projectiles(time: number) {
    let fire_angle: number;
    let proj: Sprite;
    let arc_size = randint(1, 3) * 90
    let start = randint(1, 360)
    for (let angle = 0; angle < arc_size; angle += 10) {
        fire_angle = spriteutils.degreesToRadians(start + angle)
        proj = sprites.create(assets.image`projectile`, SpriteKind.Projectile)
        proj.setPosition(skull.x, skull.y)
        proj.z = -1
        proj.setFlag(SpriteFlag.AutoDestroy, true)
        spriteutils.setVelocityAtAngle(proj, fire_angle, 40)
        pause(time)
    }
}

sprites.onDestroyed(SpriteKind.Projectile, function on_destroy(proj: Sprite) {
    info.changeScoreBy(10)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.rock, function hit_rock(proj: Sprite, rock: Sprite) {
    proj.destroy()
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function game_over(player: Sprite, proj: Sprite) {
    //  edit 
    if (blocking) {
        proj.setKind(SpriteKind.player_projectile)
        proj.vx *= -1
        proj.vy *= -1
    } else {
        game.over(false)
    }
    
})
sprites.onOverlap(SpriteKind.rock, SpriteKind.rock, function fix_double_rock(rock: Sprite, other_rock: Sprite) {
    sprites.allOfKind(SpriteKind.rock).pop().destroy()
})
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.player_projectile, function boss_hit(boss: Sprite, proj: Sprite) {
    //  
    let health_bar = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, skull)
    health_bar.value -= 50
    proj.destroy()
    if (health_bar.value < 1) {
        game.over(true)
    }
    
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function throttle_block() {
    // 
    timer.throttle("block", 2000, function block() {
        // 
        
        me.setImage(assets.image`shield`)
        blocking = true
        pause(1000)
        me.setImage(assets.image`me`)
        blocking = false
    })
})
function reactivate_controls() {
    controller.moveSprite(me)
    me.setVelocity(0, 0)
}

//  timer.after(100, reactivate_controls) # remove
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function knock_back(player: Sprite, skull: Sprite) {
    //  controller.move_sprite(me, 0, 0) # remove
    player.sayText("ow", 500)
    let angle = spriteutils.angleFrom(skull, player)
    spriteutils.setVelocityAtAngle(player, angle, 150)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.rock, function overlap_rock(player: Sprite, rock: Sprite) {
    let angle = spriteutils.angleFrom(rock, player)
    spriteutils.placeAngleFrom(player, angle, 16, rock)
})
function movement() {
    if (controller.up.isPressed()) {
        me.vy -= acceleration
    } else if (controller.down.isPressed()) {
        me.vy += acceleration
    }
    
    if (controller.left.isPressed()) {
        me.vx -= acceleration
    } else if (controller.right.isPressed()) {
        me.vx += acceleration
    }
    
    me.vx *= deceleration
    me.vy *= deceleration
}

function move_check() {
    
    if (Math.abs(me.vx) > 8 || Math.abs(me.vy) > 8) {
        if (!is_moving) {
            animation.runImageAnimation(me, assets.animation`walking`, 100, true)
            is_moving = true
        }
        
    } else {
        animation.stopAnimation(animation.AnimationTypes.All, me)
        is_moving = false
    }
    
}

game.onUpdate(function tick() {
    movement()
    move_check()
})
