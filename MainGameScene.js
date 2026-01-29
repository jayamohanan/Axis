// MainGameScene.js - Core gameplay with rotating ball and enemies
class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    init(data) {
        this.currentLevelIndex = data.levelIndex || 0;
        this.levelsData = null;
    }

    preload() {
        // Load levels data
        this.load.json('levels', 'levels.json');
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        
        // Load levels data
        this.levelsData = this.cache.json.get('levels');
        
        if (!this.levelsData || !this.levelsData.levels || this.levelsData.levels.length === 0) {
            console.error('No levels data found!');
            return;
        }

        // Load current level
        this.currentLevel = this.levelsData.levels[this.currentLevelIndex];
        
        if (!this.currentLevel) {
            console.log('All levels completed!');
            // Could show a completion screen here
            return;
        }

        // Set up level
        this.setupLevel();
        
        // Add click/tap input
        this.input.on('pointerdown', this.releaseBall, this);

        // Add spacebar key input for desktop
        this.input.keyboard.on('keydown-SPACE', this.releaseBall, this);

        // Add editor button in top-right corner
        const editorBtn = this.add.text(width - 20, 20, 'EDITOR', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#4a90e2',
            padding: { x: 15, y: 8 }
        });
        editorBtn.setOrigin(1, 0);
        editorBtn.setInteractive({ useHandCursor: true });
        editorBtn.on('pointerdown', () => {
            this.scene.start('EditorScene');
        });
    }

    setupLevel() {
        const level = this.currentLevel;
        
        // Store axis position and rotation parameters
        this.axisX = level.axisPosition.x;
        this.axisY = level.axisPosition.y;
        this.rotationRadius = level.rotationRadius || CONFIG.ROTATION_RADIUS;
        this.rotationSpeed = level.rotationSpeed || CONFIG.ROTATION_SPEED;
        
        // Current rotation angle
        this.currentAngle = 0;
        
        // Draw debug boundaries if enabled
        if (CONFIG.DEBUG_BOUNDARY) {
            this.drawDebugBoundaries();
        }
        
        // Draw axis (center point)
        this.axis = this.add.circle(this.axisX, this.axisY, CONFIG.AXIS_RADIUS, CONFIG.AXIS_COLOR);
        
        // Create rope line
        this.rope = this.add.graphics();
        
        // Create rotating ball
        this.createBall();
        
        // Create enemies
        this.enemies = [];
        level.enemies.forEach(enemyData => {
            this.createEnemy(enemyData.x, enemyData.y, enemyData.hp);
        });
        
        // Track released balls
        this.releasedBalls = [];
    }

    drawDebugBoundaries() {
        const { width, height } = this.sys.game.canvas;
        const debugGraphics = this.add.graphics();
        
        // Draw rotation area circle (filled) around axis
        debugGraphics.fillStyle(CONFIG.ROTATION_AREA_COLOR, CONFIG.ROTATION_AREA_ALPHA);
        debugGraphics.fillCircle(this.axisX, this.axisY, this.rotationRadius);
        
        // Draw portrait boundary in red
        debugGraphics.lineStyle(3, 0xff0000, 1);
        debugGraphics.strokeRect(0, 0, width, height);
    }

    createBall() {
        // Calculate initial position
        const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
        const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
        
        // Initialize trail graphics first (so it's behind the ball)
        const trailGraphics = this.add.graphics();
        
        // Create ball
        this.ball = this.add.circle(ballX, ballY, CONFIG.BALL_RADIUS, CONFIG.BALL_COLOR);
        this.physics.add.existing(this.ball);
        this.ball.body.setCircle(CONFIG.BALL_RADIUS);
        // Don't collide with world bounds - ball will pass through
        this.ball.body.setCollideWorldBounds(false);
        
        // Ball is rotating, not released yet
        this.ball.isReleased = false;
        
        // Initialize trail for this ball
        this.ball.trail = [];
        this.ball.trailGraphics = trailGraphics;
    }

    createEnemy(x, y, hp) {
        const enemy = this.add.circle(x, y, CONFIG.ENEMY_RADIUS, CONFIG.ENEMY_COLOR);
        this.physics.add.existing(enemy, true); // true = static body
        enemy.body.setCircle(CONFIG.ENEMY_RADIUS);
        
        // Store HP
        enemy.hp = hp;
        enemy.maxHp = hp;
        
        // Add HP text
        enemy.hpText = this.add.text(x, y, hp.toString(), {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        enemy.hpText.setOrigin(0.5, 0.5);
        
        this.enemies.push(enemy);
    }

    update(time, delta) {
        // Update rotation angle
        if (this.ball && !this.ball.isReleased) {
            this.currentAngle += this.rotationSpeed * (delta / 1000);
            
            // Calculate new position
            const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
            const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
            
            this.ball.setPosition(ballX, ballY);
            
            // Update trail for rotating ball
            this.updateTrail(this.ball);
            
            // Draw rope
            this.rope.clear();
            this.rope.lineStyle(CONFIG.ROPE_WIDTH, CONFIG.ROPE_COLOR);
            this.rope.lineBetween(this.axisX, this.axisY, ballX, ballY);
        }
        
        // Update trails for released balls
        this.releasedBalls.forEach((releasedBall) => {
            if (releasedBall.active) {
                this.updateTrail(releasedBall);
            }
        });
        
        // Check collisions for released balls
        this.releasedBalls.forEach((releasedBall, index) => {
            if (!releasedBall.active) {
                return;
            }
            
            // Check if ball went out of bounds
            const { width, height } = this.sys.game.canvas;
            if (releasedBall.x < 0 || releasedBall.x > width || 
                releasedBall.y < 0 || releasedBall.y > height) {
                this.destroyBallWithTrail(releasedBall);
                this.checkSpawnNewBall();
                return;
            }
            
            // Check collision with enemies
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.active && this.checkCollision(releasedBall, enemy)) {
                    // Deal damage
                    enemy.hp -= CONFIG.BALL_DAMAGE;
                    enemy.hpText.setText(Math.max(0, enemy.hp).toString());
                    
                    // Flash enemy
                    this.tweens.add({
                        targets: enemy,
                        alpha: 0.3,
                        duration: 100,
                        yoyo: true,
                        repeat: 1
                    });
                    
                    // Destroy ball on hit
                    this.destroyBallWithTrail(releasedBall);
                    this.checkSpawnNewBall();
                    
                    // Check if enemy is dead
                    if (enemy.hp <= 0) {
                        this.destroyEnemy(enemy, enemyIndex);
                    }
                }
            });
        });
        
        // Remove destroyed balls from array
        this.releasedBalls = this.releasedBalls.filter(ball => ball.active);
        
        // Check win condition
        if (this.enemies.length === 0 || this.enemies.every(e => !e.active)) {
            this.levelComplete();
        }
    }

    checkCollision(ball, enemy) {
        if (!ball.active || !enemy.active) return false;
        
        const dx = ball.x - enemy.x;
        const dy = ball.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (CONFIG.BALL_RADIUS + CONFIG.ENEMY_RADIUS);
    }

    updateTrail(ball) {
        if (!ball || !ball.active) return;
        
        // Add current position to trail
        ball.trail.push({ x: ball.x, y: ball.y });
        
        // Keep trail length limited
        if (ball.trail.length > CONFIG.TRAIL_LENGTH) {
            ball.trail.shift();
        }
        
        // Draw trail
        ball.trailGraphics.clear();
        
        for (let i = 0; i < ball.trail.length - 1; i++) {
            const point = ball.trail[i];
            const nextPoint = ball.trail[i + 1];
            
            // Calculate size and alpha based on position in trail
            const progress = i / (ball.trail.length - 1);
            const radius = CONFIG.BALL_RADIUS * progress;
            const alpha = CONFIG.TRAIL_MIN_ALPHA + (CONFIG.TRAIL_MAX_ALPHA - CONFIG.TRAIL_MIN_ALPHA) * progress;
            
            // Draw line segment
            ball.trailGraphics.lineStyle(radius * 2, CONFIG.TRAIL_COLOR, alpha);
            ball.trailGraphics.lineBetween(point.x, point.y, nextPoint.x, nextPoint.y);
        }
    }

    destroyBallWithTrail(ball) {
        if (ball.trailGraphics) {
            ball.trailGraphics.destroy();
        }
        ball.destroy();
    }

    destroyEnemy(enemy, index) {
        // Explosion effect
        this.tweens.add({
            targets: enemy,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                enemy.destroy();
                if (enemy.hpText) {
                    enemy.hpText.destroy();
                }
            }
        });
        
        // Mark as inactive
        enemy.active = false;
    }

    checkSpawnNewBall() {
        // Only spawn new ball if there's no ball currently rotating
        if (!this.ball && this.pendingReleaseAngle !== undefined) {
            // Clear any old trail graphics
            if (this.oldBallTrailGraphics) {
                this.oldBallTrailGraphics.destroy();
                this.oldBallTrailGraphics = null;
            }
            
            this.currentAngle = this.pendingReleaseAngle;
            this.createBall();
            this.pendingReleaseAngle = undefined;
        }
    }

    releaseBall() {
        if (!this.ball || this.ball.isReleased) {
            return;
        }
        
        // Store the release position and angle
        const releaseAngle = this.currentAngle;
        
        // Calculate tangential velocity based on physics: v = ω × r
        // Where ω (omega) = angular velocity, r = radius
        const tangentialSpeed = this.rotationSpeed * this.rotationRadius;
        
        // Calculate tangential velocity direction (perpendicular to radius)
        // For counter-clockwise rotation, tangent vector is (-sin(θ), cos(θ))
        const velocityX = -Math.sin(this.currentAngle) * tangentialSpeed;
        const velocityY = Math.cos(this.currentAngle) * tangentialSpeed;
        
        // Set velocity
        this.ball.body.setVelocity(velocityX, velocityY);
        this.ball.isReleased = true;
        
        // Add to released balls array for collision tracking
        this.releasedBalls.push(this.ball);
        
        // Clear rope
        this.rope.clear();
        
        // Store release angle for new ball spawn
        this.pendingReleaseAngle = releaseAngle;
        
        // Remove reference to current ball
        this.ball = null;
    }

    levelComplete() {
        // Prevent multiple triggers
        if (this.isCompleting) return;
        this.isCompleting = true;
        
        // Show win message
        const { width, height } = this.sys.game.canvas;
        const winText = this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '48px',
            color: '#ffffff',
            backgroundColor: '#4a90e2',
            padding: { x: 30, y: 15 }
        });
        winText.setOrigin(0.5, 0.5);
        
        // Wait and go to next level
        this.time.delayedCall(2000, () => {
            this.currentLevelIndex++;
            if (this.currentLevelIndex < this.levelsData.levels.length) {
                this.scene.restart({ levelIndex: this.currentLevelIndex });
            } else {
                // All levels complete
                const allCompleteText = this.add.text(width / 2, height / 2 + 100, 'ALL LEVELS COMPLETE!', {
                    fontFamily: CONFIG.FONT_FAMILY,
                    fontSize: '36px',
                    color: '#ffffff',
                    backgroundColor: '#4CAF50',
                    padding: { x: 20, y: 10 }
                });
                allCompleteText.setOrigin(0.5, 0.5);
            }
        });
    }
}
