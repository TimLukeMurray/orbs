let flock = [];
let predator;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 100; i++) {
        flock.push(new Boid());
    }
    predator = new Predator();
}

function draw() {
    background(255);
    predator.behave(flock);
    predator.move();
    predator.display();
    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.avoid(predator);
        boid.update();
        boid.show();
    }
}

class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.maxForce = 0.2;
        this.maxSpeed = 4;
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    align(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let perceptionRadius = 25;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    avoid(predator) {
        let perceptionRadius = 100;
        let steering = createVector();
        let d = dist(this.position.x, this.position.y, predator.position.x, predator.position.y);
        if (d < perceptionRadius) {
            let diff = p5.Vector.sub(this.position, predator.position);
            diff.div(d);
            steering.add(diff);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce * 5);
        }
        this.acceleration.add(steering);
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        strokeWeight(8);
        stroke(0);
        point(this.position.x, this.position.y);
    }
}

class Predator {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(3, 5));
    }

    move() {
        this.position.add(this.velocity);
        // Wrap around edges of the canvas
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    display() {
        fill(255, 0, 0);
        noStroke();
        ellipse(this.position.x, this.position.y, 20, 20);
    }

    behave(boids) {
        if (random(100) < 2) {
            let centroid = this.findLargestGroupCentroid(boids);
            this.steerTowards(centroid);
        }
    }

    findLargestGroupCentroid(boids) {
        let perceptionRadius = 50;
        let groups = [];
        let visited = new Array(boids.length).fill(false);

        for (let i = 0; i < boids.length; i++) {
            if (!visited[i]) {
                let stack = [boids[i]];
                let group = [];
                while (stack.length > 0) {
                    let current = stack.pop();
                    group.push(current);
                    visited[boids.indexOf(current)] = true;
                    for (let other of boids) {
                        if (!visited[boids.indexOf(other)] && p5.Vector.dist(current.position, other.position) < perceptionRadius) {
                            stack.push(other);
                            visited[boids.indexOf(other)] = true;
                        }
                    }
                }
                groups.push(group);
            }
        }

        let largestGroup = groups.reduce((lg, g) => g.length > lg.length ? g : lg, []);
        let centroid = createVector(0, 0);
        for (let boid of largestGroup) {
            centroid.add(boid.position);
        }
        centroid.div(largestGroup.length);
        return centroid;
    }

    steerTowards(centroid) {
        this.velocity = p5.Vector.sub(centroid, this.position);
        this.velocity.setMag(random(3, 5)); // Set velocity towards centroid with current speed
    }
}
