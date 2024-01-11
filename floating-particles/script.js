/** @type {HTMLCanvasElement} **/

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.strokeStyle = 'white';

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.radius = 15;
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        /* starting positions of particles on x and y axes
           range of pos & neg starts particles in diff directions */
        this.vx = Math.random() * 0.25 - 0.025; 
        this.vy = Math.random() * 0.25 - 0.025; 

        /* randomize particle color with entire color spectrum (0-360) */
        this.color = 'hsl(' + Math.random() * 360 + ', 40%, 70%)';
    }
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        /* defining path: x,y coords of circle center, radius, start angle, end angle */
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill(); /* drawing circle */
        context.stroke();
    }
    update() {
        this.x += this.vx;
        /*  endless bouncing:
            when x reaches width edge on R, velocity of x = -1 (flips direction)
            when x reaches width edge on L, -1 * -1 = +1 (flips direction again) */
        if (this.x > this.effect.width - this.radius || this.x < 0) this.vx *= -1;

        this.y += this.vy;
        if (this.y > this.effect.height - this.radius || this.y < 0) this.vy *= -1;
    }
}

class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 80;
        this.createParticles();
    }
    createParticles() {
        for (let i=0; i<this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
            /* creating new particles with constructor, 
            passing in Effect class referenced by (this) */
        }
    }
    handleParticles(context) {
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
}

const effect = new Effect(canvas);
effect.handleParticles(ctx);

function animate() {
    ctx.clearRect(0, 0 , canvas.width, canvas.height);
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();