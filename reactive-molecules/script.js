/** @type {HTMLCanvasElement} **/

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.strokeStyle = '#C1B6C6';

class Particle {
    constructor(effect) {
        this.effect = effect;
        // random circle sizes, wrapped in floor for better performance
        this.radius = Math.floor(Math.random() * 6 + 3); 

        // random particle distribution
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);

        /* starting positions of particles on x and y axes;
           range of pos & neg starts particles in diff directions */
        this.vx = Math.random() * 0.25 - 0.025; 
        this.vy = Math.random() * 0.25 - 0.025; 

        // for determining speed of mouse push
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.4;

        // randomize particle color with entire color spectrum (0-360)
        this.color = 'hsl(' + Math.random() * 360 + ', 30%, 80%)';
    }
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        // defining path: x,y coords of circle center, radius, start angle, end angle
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill(); // drawing circle 
    }
    update() {
        /* calculate dist between particle and mouse
           using pythagorean theorem: a^2+b^2=c^2 */
        const dx = this.x - this.effect.mouse.x;
        const dy = this.y - this.effect.mouse.y;
        const distance = Math.hypot(dx, dy);

        // controlling particle movement speed as caused by mouse 
        const force = this.effect.mouse.radius / distance; 

        if (distance < this.effect.mouse.radius) {
            /* if mouse within mouse influence radius,
               calculate angle of distance to determine particle mvmt */
            const angle = Math.atan2(dy, dx); 
            /* atan2 (arctangent function) gives counterclockwise angle in radians
               btwn positive x-axis and projected line from 0,0 to target point */
            this.pushX += Math.cos(angle) * force; // determines horizontal movement 
            this.pushY += Math.sin(angle) * force; // determines vertical movement 
        }

        // endless bouncing for x & y axes
        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;

        /* if/else ensuring particles do not disappear off screen: left, right, top, bottom;
           velocity is set to -1 to flip direction away from edge */
        if (this.x < this.radius) {
            this.x = this.radius 
            this.vx *= -1; 
        } else if (this.x > this.effect.width - this.radius) { 
            this.x = this.effect.width - this.radius;
            this.vx *= -1;
        }
        if (this.y < this.radius) {
            this.y = this.radius 
            this.vy *= -1; 
        } else if (this.y > this.effect.height - this.radius) { 
            this.y = this.effect.height - this.radius;
            this.vy *= -1;
        }
    }
    // redistributing particle when canvas is resized 
    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

class Effect {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 222;
        this.createParticles();

        // reactivity to mouse 
        this.mouse = {
            x: 0,
            y: 0,
            radius: 120 // area of mouse influence 
        }
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        // accounting for window resizing 
        window.addEventListener('resize', e => {
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
        });
    }
    createParticles() {
        for (let i=0; i<this.numberOfParticles; i++) {
            // creating new particles with constructor, passing in Effect instance
            this.particles.push(new Particle(this));
        }
    }
    handleParticles(context) {
        // create strokes btwn particles 
        this.connectParticles(context); 
        // draw each particle with given context 
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
    connectParticles(context) {
        const maxDistance = 120; // between particles 
        /* comparing each particle of this.particles array 
           with all other particles in the array, in pairs a & b */
        for (let a=0; a<this.particles.length; a++) {
            for (let b=a; b<this.particles.length; b++) {
                /* calculate dist between particles a & b
                   using pythagorean theorem: a^2+b^2=c^2 */
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y; 
                const distance = Math.hypot(dx, dy); 
                if (distance < maxDistance) {
                    /* setting opacity of connecting line based on distance btwn particles
                       where low distance = high opacity and high distance = low opacity;
                       explanation of formula: 
                       using global alpha property: 0 (transparent) - 1 (opaque),
                       opacity = max value of 1 minus ratio of current distance to max distance;
                       e.g. 30 pixels apart / maxDistance of 100 = 0.3 ... 1-0.3=0.7 */
                    const opacity = 1 - (distance/maxDistance);
                    context.save();
                    context.globalAlpha = opacity;
                    context.beginPath();
                    // moveTo() defines starting coords of line 
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    /* lineTo() defines next point along path, 
                       in this case defining ending coords of line */
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    // making canvas responsive 
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height; 
        this.width = width;
        this.height = height;

        // redeclaring style as resizing canvas resets rendering context to default 
        this.context.fillStyle = this.color;
        this.context.strokeStyle = '#C1B6C6';

        // calling Effect class reset() to redistribute each particle 
        this.particles.forEach(particle => {
            particle.reset();
        });
    }
}

const effect = new Effect(canvas, ctx);

function animate() {
    ctx.clearRect(0, 0 , canvas.width, canvas.height);
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();