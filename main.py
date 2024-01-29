@namespace
class SpriteKind:
    rock = SpriteKind.create()

# sprites
me = sprites.create(assets.image("me"), SpriteKind.player)
controller.move_sprite(me)
me.set_position(20, 20)
me.set_stay_in_screen(True)
skull = sprites.create(assets.image("flaming skull"), SpriteKind.enemy)
animation.run_image_animation(skull, assets.animation("flaming"), 150, True)
animation.run_movement_animation(skull, animation.animation_presets(animation.bobbing), 4000, True)

# setup
scene.set_background_image(assets.image("background"))
spriteutils.set_console_overlay(True)

# gh
# variables
is_moving = False
acceleration = 8
deceleration = 0.9
# /gh

def fire():
    for i in range(randint(1, 3)):
        timer.background(spawn_rock)
    pause(500)
    music.play(music.melody_playable(music.buzzer), music.PlaybackMode.UNTIL_DONE)
    if randint(1, 2) == 2:
        generate_projectiles(50)
    else:
        generate_projectiles(0)
    timer.after(randint(3500, 5000), fire)
timer.after(randint(3500, 5000), fire)

def generate_projectiles(time):
    arc_size = randint(1, 3) * 90
    start = randint(1, 360)
    for angle in range(0, arc_size, 10):
        fire_angle = spriteutils.degrees_to_radians(start + angle)
        proj = sprites.create(assets.image("projectile"), SpriteKind.projectile)
        proj.set_position(skull.x, skull.y)
        proj.z = -1
        proj.set_flag(SpriteFlag.AUTO_DESTROY, True)
        spriteutils.set_velocity_at_angle(proj, fire_angle, 40)
        pause(time)

def spawn_rock():
    rock = sprites.create(image.create(16, 16), SpriteKind.rock)
    spriteutils.place_angle_from(rock, randint(0, Math.PI * 2), 35, spriteutils.pos(80, 60))
    anim: List[Image] = assets.animation("entry")
    frame_len = 100
    scene.camera_shake(4, len(anim) * frame_len)
    animation.run_image_animation(rock, anim, frame_len, False)
    pause(randint(2500, 8000))
    anim.reverse()
    animation.run_image_animation(rock, anim, frame_len, False)
    rock.lifespan = frame_len * len(anim)

def on_destroy(proj):
    info.change_score_by(10)
sprites.on_destroyed(SpriteKind.projectile, on_destroy)

def hit_rock(proj, rock):
    proj.destroy()
sprites.on_overlap(SpriteKind.projectile, SpriteKind.rock, hit_rock)

def game_over(player, proj):
    game.over(False)
sprites.on_overlap(SpriteKind.player, SpriteKind.projectile, game_over)

def fix_double_rock(rock, other_rock):
    sprites.all_of_kind(SpriteKind.rock).pop().destroy()
sprites.on_overlap(SpriteKind.rock, SpriteKind.rock, fix_double_rock)

def reactivate_controls():
    controller.move_sprite(me)
    me.set_velocity(0, 0)

def knock_back(player, skull):
    controller.move_sprite(me, 0, 0)
    player.say_text("ow", 500)
    angle = spriteutils.angle_from(skull, player)
    spriteutils.set_velocity_at_angle(player, angle, 150)
    timer.after(100, reactivate_controls)
sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, knock_back)

def overlap_rock(player, rock):
    angle = spriteutils.angle_from(rock, player)
    spriteutils.place_angle_from(player, angle, 16, rock)
sprites.on_overlap(SpriteKind.player, SpriteKind.rock, overlap_rock)

# gh
def movement():
    if controller.up.is_pressed():
        me.vy -= acceleration
    elif controller.down.is_pressed():
        me.vy += acceleration
    if controller.left.is_pressed():
        me.vx -= acceleration
    elif controller.right.is_pressed():
        me.vx += acceleration
    me.vx *= deceleration
    me.vy *= deceleration
    
def move_check():
    global is_moving
    if Math.abs(me.vx) > 8 or Math.abs(me.vy) > 8:
        if not is_moving:
            animation.run_image_animation(me, assets.animation("walking"), 100, True)
            is_moving = True
    else:
        animation.stop_animation(animation.AnimationTypes.ALL, me)
        is_moving = False

def tick():
    movement()
    move_check()
game.on_update(tick)
# /gh