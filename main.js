// Made by @Pwea


// Setup
const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.position = "absolute"
let { ctx, dpi, set, get } = canvas;

const background_music = new Audio("./backgrnd_music.wav")
const knockout = new Audio("./knockout.wav")
const shrink = new Audio("./shrink.wav")


/* NOTES 
- The draw() function can be modified!
- Make a functional start menu
- make a logo
- take screenshots
- Make enemies flicker white when hit
*/

// Settings
const projectile_speed = 5


console.log(canvas)

class Score {
    constructor(x, y, score) {
        this.x = x
        this.y = y
        this.score = score
    }
    draw() {
        context.fillStyle = "white"
        context.font = "20px Arial";
        context.fillText(`Score: ${this.score}`,this.x,this.y);
    }
    update(bonus) {
        this.draw()
        if (bonus === true) {
            this.score += 20
        } else {
            this.score += 10
        }
    }
}

// Player Template
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
    }
}

// Projectile Template
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Enemy Template
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Particle Template
const friction = 1
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        context.save()
        context.globalAlpha = 0.3
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class Game_Over {
    constructor(width, height, score, time) {
        this.x = canvas.width/2
        this.y = canvas.height/2
        this.width = width
        this.height = height
        this.x -= this.width/2
        this.y -= this.height/2
        this.score = score
        this.time = time
        this.btnX = this.x * 1.06
        this.btnY = this.y * 1.3
        this.btnW = this.width / 1.2
        this.btnH = this.height / 4
    }
    draw() {
        context.fillStyle = "white"
        context.fillRect(this.x, this.y, this.width, this.height)
        context.fillStyle = "cornflowerblue"
        context.fillRect(this.btnX, this.btnY, this.btnW, this.btnH)
        context.fillStyle = "black"
        context.font = "20px Georgia, serif";
        context.fillText(`Score: ${this.score} points`,this.x + 50,this.y + 50)
        context.fillText(`Time: ${this.time} seconds`, this.x + 50, this.y + 80)
        context.fillText("Made By @Pwea", this.btnX + 120, this.btnY + 75)
        context.fillStyle = "white"
        context.fillText("Play Again", this.btnX + 120, this.btnY + 25)
    }
}



const main_x = canvas.width/2
const main_y = canvas.height/2

// Create Player
const player = new Player(main_x,main_y,10,"white")

// Create Score
const score = new Score(30, 30, 0)


const projectiles = []
const enemies = []
const particles = []
const enemy_size = [10, 30]
var wave = 0
let game_over = false

var seconds = 0

function playTime() {
    setInterval(() => {
        seconds += 1
    }, 1000)
}



// Spawn enemies on screen
function spawnEnemies() {
    setInterval(() => {
        let radius = Math.random() * (enemy_size[1] - enemy_size[0]) + enemy_size[0]
        
        if (score.score >= 1000) {
            wave += 0.5
        } else if (score.score >= 5000) {
            wave += 0.5
        } else if (score.score >= 10000) {
            wave += 0.5
        }


        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius:canvas.width + radius
            y = Math.random() *canvas.height
        } else {
            x = Math.random() *canvas.width
            y = Math.random() < 0.5 ? 0 - radius:canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%`
        const angle = Math.atan2(
            canvas.height/2 - y,
            canvas.width/2 - x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        if (game_over !== true) {
            enemies.push(new Enemy(x, y, radius + (wave*1.01), color, velocity))
        } else {
            enemies.length = 0
        }
        console.log(enemies)
    }, 1500)
}

// Makes everything moving
let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    context.fillStyle = "rgba(0, 0, 0, 0.1)"
    context.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    score.draw()
    background_music.play()

    // Remove Explosion
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        particle.update()
    })

    // Remove Projectiles
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // Remove projectiles when hit edges of screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height

            ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    // Enemy Detection
    enemies.forEach((enemy, index) => {
        enemy.update()
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // Stops the Game
        if (distance - enemy.radius - player.radius < 1) {
            game_over = true
            const gameOver = new Game_Over(400,300,score.score, seconds)
            gameOver.draw()
            console.log(seconds)
            background_music.pause()
            cancelAnimationFrame(animationId)
        }

        // Remove enemy when shot
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // When projectiles hit enemy
            if (distance - enemy.radius - projectile.radius < 1) {
                score.update(false)

                // Shrink Enemy
                if (enemy.radius - 15 > 10) {
                    enemy.radius -= 10
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                        const shrink_copy = shrink.cloneNode()
                        shrink_copy.play()
                    }, 0)
                } else {
                    score.update(true)
                    
                    setTimeout(() => {
                        // Create explosion
                        for (let i = 0; i < enemy.radius; i++) {
                            particles.push(new Particle(
                                projectile.x,
                                projectile.y,
                                Math.random() * 4,
                                enemy.color,
                                {
                                    x: Math.random() - 0.5 * (Math.random() * 2),
                                    y: Math.random() - 0.5 * (Math.random() * 2)
                                }))
                            }
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                        canvas.style.animation = "screen_shake 0.5s"
                        const knockout_copy = knockout.cloneNode()
                        knockout_copy.play()
                    }, 0)
                    canvas.style.animation = ""
                }
            }
        })
    })
}

//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

window.addEventListener("click", (evt) => {
    const angle = Math.atan2(
        evt.clientY - canvas.height/2,
        evt.clientX - canvas.width/2
    )
    const velocity = {
        x: Math.cos(angle) * projectile_speed,
        y: Math.sin(angle) * projectile_speed
    }
    projectiles.push(new Projectile(
        canvas.width/2, canvas.height/2, 5, "white", velocity
    ))
})

const game_over_template = new Game_Over(400, 300, 0, 0)

var rect = {
    x: game_over_template.btnX,
    y: game_over_template.btnY,
    width: game_over_template.btnW,
    height: game_over_template.btnH
}

canvas.addEventListener("click", (evt) => {
    if (game_over !== true) return;
    var mouse_pos = getMousePos(canvas, evt)

    if (isInside(mouse_pos, rect)) {
        game_over = false
        score.score = 0
        seconds = 0
        wave = 0
        animate()
    }
})

animate()
spawnEnemies()
playTime()
