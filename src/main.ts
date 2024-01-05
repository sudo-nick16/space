import "./main.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const ctx = canvas.getContext("2d")!;

const getCoord = () => {
	return [Math.random()*canvas.width, Math.random()*canvas.height];
}

ctx.shadowBlur = 30;
ctx.shadowColor = "white";

class Space {
	width: number;
	height: number;
	clusters: { radius: number, velocity: number[], stars: number[][]}[] = [];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	clear() {
		ctx.fillStyle = "#151515";
		ctx.fillRect(0, 0, this.width, this.height);
	}

	genCluster(radius: number, count: number = 100, velocity: number[] = [5, 5]) {
		const stars = []
		for (let i = 0; i < count; ++i) {
			stars.push(getCoord());
		}
		this.clusters.push({ radius, stars, velocity });
	}

	render() {
		for (let c of this.clusters) {
			for (let [x, y] of c.stars) {
				ctx.beginPath()
				ctx.arc(x, y, c.radius, 0, 360);
				ctx.fillStyle = "white";
				ctx.fill();
			}
		}
	}

	update() {
		this.clusters.forEach(c => {
			c.stars.forEach(s => {
				s[0] = s[0] > 0 ? ((s[0] + c.velocity[0]) % this.width) : this.width;
				s[1] = s[1] > 0 ? ((s[1] + c.velocity[1]) % this.height) : this.height;
			})
		})
	}

	updateDirection(angle: number) {
		const dx = Math.abs(angle) >= (Math.PI/2) ? 1 : -1;
		const dy = angle >= 0 ? -1 : 1;
		this.clusters.forEach(c => {
			c.velocity = [dx * c.velocity[0], dy * c.velocity[1]]; 
		})
	}
}

class Ship {
	center: number[] = [canvas.width/2, canvas.height/2];
	vertices: number[][]; 
	size: number;
	angle: number;
	constructor(size: number = 10) {
		this.size = size;
		this.angle = 0;
		this.vertices = [
			[this.center[0], this.center[1] + size/2],
			[this.center[0] + size/2, this.center[1] - size/2],
			[this.center[0] - size/2, this.center[1] - size/2]
		]
	}

	render() {
		ctx.translate(this.center[0], this.center[1]);
		ctx.rotate(this.angle);
		ctx.beginPath();
		ctx.moveTo(this.size * Math.cos(0), this.size * Math.sin(0));          
		for (var i = 1; i <= 3;i += 1) {
			ctx.lineTo(this.size * Math.cos(i * 2 * Math.PI / 3), this.size * Math.sin(i * 2 * Math.PI / 3));
		}
		ctx.closePath();
		ctx.fillStyle="yellow";
		ctx.strokeStyle = "orange";
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.fill();
		ctx.rotate(-this.angle);
		ctx.translate(-this.center[0],-this.center[1]);
	}

	setAngle(angle: number) {
		this.angle = angle;
	}
}

const space = new Space(canvas.width, canvas.height); 
space.genCluster(4, 50, [4, 4]);
space.genCluster(3, 50, [3, 3]);
space.genCluster(1, 50, [2, 2]);

const ship = new Ship(30);

window.addEventListener('mousemove', (e) => {
	const rx = e.x - ship.center[0]
	const ry = e.y - ship.center[1];
	const angle = Math.atan2(ry, rx);
	ship.setAngle(angle);
	space.updateDirection(angle);
})


const eventLoop = () => {
	space.clear();
	space.render();
	ship.render();
	space.update();
	requestAnimationFrame(eventLoop);
}

requestAnimationFrame(eventLoop);

