// Advanced 3D Sphere System with Multiple Variations
class Sphere3D {
    constructor() {
        this.currentStyle = 1;
        this.canvas = null;
        this.ctx = null;
        this.rotation = 0;
        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'sphere3d';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        // Handle resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        // Start animation
        this.animate();
    }

    // Convert 3D sphere point to 2D canvas point
    project3D(x, y, z, centerX, centerY, scale = 1, tiltX = 0) {
        // Apply X-axis rotation (tilt) first
        const cosX = Math.cos(tiltX);
        const sinX = Math.sin(tiltX);
        const rotatedY = y * cosX - z * sinX;
        const rotatedZ = y * sinX + z * cosX;

        const perspective = 1500;
        const projScale = perspective / (perspective + rotatedZ * scale);

        return {
            x: centerX + x * projScale * scale,
            y: centerY + rotatedY * projScale * scale,
            scale: projScale,
            z: rotatedZ,
            visible: rotatedZ > -0.7 // Show more of the sphere (was -0.95)
        };
    }

    // Style 1: Classic Grid Sphere
    drawGridSphere() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 + 200; // Moved down 200px (was 400px)
        const radius = 450; // Increased from 250 for much larger sphere
        const tiltX = Math.PI / 8; // 22.5 degree tilt for better 3D effect

        // Draw latitude lines
        for (let lat = -80; lat <= 80; lat += 20) {
            const points = [];

            // First pass: collect all points
            for (let lon = 0; lon <= 360; lon += 3) { // Smoother with smaller steps
                const phi = (90 - lat) * Math.PI / 180;
                const theta = (lon + this.rotation) * Math.PI / 180;

                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);

                const point = this.project3D(x, y, z, centerX, centerY, 1, tiltX);
                points.push({ ...point, lon });
            }

            // Second pass: draw continuous line segments
            this.ctx.strokeStyle = `rgba(150, 210, 255, ${0.16})`; // 20% less visible than 0.20
            this.ctx.lineWidth = 1;

            let currentPath = false;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                if (point.visible) {
                    if (!currentPath) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(point.x, point.y);
                        currentPath = true;
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                } else {
                    if (currentPath) {
                        this.ctx.stroke();
                        currentPath = false;
                    }
                }
            }
            if (currentPath) {
                this.ctx.stroke();
            }
        }

        // Draw longitude lines
        for (let lon = 0; lon < 360; lon += 20) {
            const points = [];

            // First pass: collect all points
            for (let lat = -90; lat <= 90; lat += 3) { // Smoother with smaller steps
                const phi = (90 - lat) * Math.PI / 180;
                const theta = (lon + this.rotation) * Math.PI / 180;

                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);

                const point = this.project3D(x, y, z, centerX, centerY, 1, tiltX);
                points.push({ ...point, lat });
            }

            // Second pass: draw continuous line segments
            this.ctx.strokeStyle = `rgba(120, 150, 220, ${0.16})`; // 20% less visible than 0.20
            this.ctx.lineWidth = 1;

            let currentPath = false;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                if (point.visible) {
                    if (!currentPath) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(point.x, point.y);
                        currentPath = true;
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                } else {
                    if (currentPath) {
                        this.ctx.stroke();
                        currentPath = false;
                    }
                }
            }
            if (currentPath) {
                this.ctx.stroke();
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle gradient overlay for depth
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.7
        );
        gradient.addColorStop(0, 'rgba(160, 220, 255, 0.03)');
        gradient.addColorStop(0.5, 'rgba(130, 170, 230, 0.02)');
        gradient.addColorStop(1, 'rgba(50, 80, 120, 0.05)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Always draw the grid sphere (option 1)
        this.drawGridSphere();

        // Add highlight gradient for 3D effect
        const highlightGradient = this.ctx.createRadialGradient(
            this.canvas.width * 0.4, this.canvas.height * 0.3, 0,
            this.canvas.width * 0.4, this.canvas.height * 0.3, 300
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = highlightGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        this.rotation += 0.25; // Half speed (was 0.5)
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sphere3d = new Sphere3D();
});