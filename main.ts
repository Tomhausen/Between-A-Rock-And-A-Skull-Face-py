namespace SpriteKind {
    export const rock = SpriteKind.create()
}

//  sprites
let me = sprites.create(assets.image`me`, SpriteKind.Player)
controller.moveSprite(me)
me.setPosition(20, 20)
me.setStayInScreen(true)
let skull = sprites.create(assets.image`flaming skull`, SpriteKind.Enemy)
animation.runImageAnimation(skull, assets.animation`flaming`, 150, true)
animation.runMovementAnimation(skull, animation.animationPresets(animation.bobbing), 4000, true)
//  setup
scene.setBackgroundImage(assets.image`background`)
spriteutils.setConsoleOverlay(true)
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
function game_over(player: any, proj: any) {
    game.over(false)
}

//  sprites.on_overlap(SpriteKind.player, SpriteKind.projectile, game_over)
sprites.onOverlap(SpriteKind.rock, SpriteKind.rock, function fix_double_rock(rock: Sprite, other_rock: Sprite) {
    sprites.allOfKind(SpriteKind.rock).pop().destroy()
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function knock_back(player: Sprite, skull: Sprite) {
    controller.moveSprite(me, 0, 0)
    player.sayText("ow", 500)
    let angle = spriteutils.angleFrom(skull, player)
    spriteutils.setVelocityAtAngle(player, angle, 150)
    timer.after(100, function reactivate_controls() {
        controller.moveSprite(me)
        me.setVelocity(0, 0)
    })
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.rock, function overlap_rock(player: Sprite, rock: Sprite) {
    let angle = spriteutils.angleFrom(rock, player)
    spriteutils.placeAngleFrom(player, angle, 16, rock)
})
