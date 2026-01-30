// MainGameScene.js - Combat system with player vs enemy
class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    init(data) {
        this.currentLevelIndex = data.levelIndex || 0;
        this.levelsData = null;
        
        // Combat system
        this.currentEnemyLevel = 1;  // Start at enemy level 1
        this.playerDamage = CONFIG.PLAYER_START_DAMAGE;
        this.lastAttackTime = 0;
        
        // Supply ball damage level
        this.currentSupplyLevel = 1;
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
        
        // Display current stats
        this.statsText = this.add.text(20, 20, '', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.updateStatsDisplay();
    }

    setupLevel() {
        const level = this.currentLevel;
        const { width, height } = this.sys.game.canvas;
        
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
        
        // Create rotating supply ball
        this.createSupplyBall();
        
        // Create player and enemy fighters just above center horizontal line
        const fighterY = height * 0.45;  // 45% from top (just above center)
        
        // Player on left side
        const playerX = width * 0.3;
        this.createPlayer(playerX, fighterY);
        
        // Enemy on right side
        const enemyX = width * 0.7;
        this.createEnemy(enemyX, fighterY);
        
        // Track released supply balls
        this.releasedBalls = [];
    }
    
    updateStatsDisplay() {
        this.statsText.setText(`Player DMG: ${this.playerDamage}\nSupply LVL: ${this.currentSupplyLevel}\nEnemy LVL: ${this.currentEnemyLevel}`);
    }
    
    createPlayer(x, y) {
        this.player = this.add.circle(x, y, CONFIG.BALL_RADIUS, CONFIG.PLAYER_COLOR);
        this.player.originalX = x;
        this.player.originalY = y;
        
        // Add player damage text
        this.player.damageText = this.add.text(x, y + CONFIG.BALL_RADIUS + 15, `DMG: ${this.playerDamage}`, {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.player.damageText.setOrigin(0.5, 0.5);
    }
    
    createEnemy(x, y) {
        // Get enemy HP based on current level
        const enemyHP = CONFIG.ENEMY_HP_BY_LEVEL[Math.min(this.currentEnemyLevel - 1, 19)];
        const enemyColor = CONFIG.ENEMY_COLORS[Math.min(this.currentEnemyLevel - 1, 19)];
        
        this.enemy = this.add.circle(x, y, CONFIG.BALL_RADIUS, enemyColor);
        this.enemy.originalX = x;
        this.enemy.originalY = y;
        this.enemy.hp = enemyHP;
        this.enemy.maxHp = enemyHP;
        
        // Add HP text
        this.enemy.hpText = this.add.text(x, y + CONFIG.BALL_RADIUS + 15, `HP: ${enemyHP}`, {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.enemy.hpText.setOrigin(0.5, 0.5);
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

    createSupplyBall() {
        // Calculate initial position
        const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
        const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
        
        // Initialize trail graphics first (so it's behind the ball)
        const trailGraphics = this.add.graphics();
        
        // Create supply ball (smaller, rotating ball)
        this.supplyBall = this.add.circle(ballX, ballY, CONFIG.SUPPLY_BALL_RADIUS, CONFIG.BALL_COLOR);
        this.physics.add.existing(this.supplyBall);
        this.supplyBall.body.setCircle(CONFIG.SUPPLY_BALL_RADIUS);
        this.supplyBall.body.setCollideWorldBounds(false);
        
        // Ball is rotating, not released yet
        this.supplyBall.isReleased = false;
        
        // Initialize trail
        this.supplyBall.trail = [];
        this.supplyBall.trailGraphics = trailGraphics;
    }
    
    performAttack() {
        // Player attack animation - move right then back
        this.tweens.add({
            targets: this.player,
            x: this.player.originalX + CONFIG.ATTACK_DISTANCE,
            duration: CONFIG.ATTACK_DURATION,
            ease: 'Power2',
            yoyo: true,
            onStart: () => {
                // Damage the enemy
                this.enemy.hp = Math.max(0, this.enemy.hp - this.playerDamage);
                this.enemy.hpText.setText(`HP: ${this.enemy.hp}`);
                
                // Flash and shake effect on enemy
                this.tweens.add({
                    targets: this.enemy,
                    alpha: 0.3,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true,
                    repeat: 1
                });
                
                // Create damage particles
                this.createDamageEffect(this.enemy.x, this.enemy.y);
                
                // Check if enemy is dead
                if (this.enemy.hp <= 0) {
                    this.time.delayedCall(300, () => {
                        this.enemyDefeated();
                    });
                }
            }
        });
        
        // Update damage text position
        this.tweens.add({
            targets: this.player.damageText,
            x: this.player.originalX + CONFIG.ATTACK_DISTANCE,
            duration: CONFIG.ATTACK_DURATION,
            ease: 'Power2',
            yoyo: true
        });
    }
    
    createDamageEffect(x, y) {
        // Create simple particle effect for damage
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const particle = this.add.circle(x, y, 5, 0xffff00);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 40,
                y: y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    enemyDefeated() {
        // Explosion effect
        this.tweens.add({
            targets: this.enemy,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.enemy.destroy();
                this.enemy.hpText.destroy();
                
                // White flash effect
                this.createWhiteFlash();
                
                // Spawn next enemy after flash
                this.time.delayedCall(500, () => {
                    this.currentEnemyLevel++;
                    
                    // Check if we've completed all 20 enemy levels
                    if (this.currentEnemyLevel > 20) {
                        this.allEnemiesDefeated();
                    } else {
                        this.createEnemy(this.enemy.originalX || this.sys.game.canvas.width * 0.7, 
                                       this.player.originalY);
                        this.updateStatsDisplay();
                    }
                });
            }
        });
    }
    
    createWhiteFlash() {
        const { width, height } = this.sys.game.canvas;
        const flash = this.add.rectangle(0, 0, width, height, 0xffffff);
        flash.setOrigin(0, 0);
        flash.setAlpha(0);
        
        // Flash in and out
        this.tweens.add({
            targets: flash,
            alpha: 0.8,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    allEnemiesDefeated() {
        const { width, height } = this.sys.game.canvas;
        const winText = this.add.text(width / 2, height / 2, 'ALL ENEMIES DEFEATED!\nYOU WIN!', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '48px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 15 },
            align: 'center'
        });
        winText.setOrigin(0.5, 0.5);
    }

    update(time, delta) {
        // Auto-attack system - attack every second
        if (this.enemy && this.enemy.active !== false && time - this.lastAttackTime >= CONFIG.ATTACK_INTERVAL) {
            this.lastAttackTime = time;
            this.performAttack();
        }
        
        // Update rotation angle for supply ball
        if (this.supplyBall && !this.supplyBall.isReleased) {
            this.currentAngle += this.rotationSpeed * (delta / 1000);
            
            // Calculate new position
            const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
            const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
            
            this.supplyBall.setPosition(ballX, ballY);
            
            // Update trail for rotating ball
            this.updateTrail(this.supplyBall);
            
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
        
        // Check collisions for released supply balls
        this.releasedBalls.forEach((releasedBall) => {
            if (!releasedBall.active) {
                return;
            }
            
            // Check if ball went out of bounds
            const { width, height } = this.sys.game.canvas;
            if (releasedBall.x < 0 || releasedBall.x > width || 
                releasedBall.y < 0 || releasedBall.y > height) {
                this.destroyBallWithTrail(releasedBall);
                this.checkSpawnNewSupplyBall();
                return;
            }
            
            // Check collision with player
            if (this.player && this.checkCollision(releasedBall, this.player, CONFIG.SUPPLY_BALL_RADIUS, CONFIG.BALL_RADIUS)) {
                // Add damage to player
                const damageGain = CONFIG.SUPPLY_BALL_DAMAGE[Math.min(this.currentSupplyLevel - 1, 19)];
                this.playerDamage += damageGain;
                this.player.damageText.setText(`DMG: ${this.playerDamage}`);
                
                // Flash player
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.5,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 150,
                    yoyo: true
                });
                
                // Level up supply ball
                this.currentSupplyLevel = Math.min(this.currentSupplyLevel + 1, 20);
                this.updateStatsDisplay();
                
                // Destroy supply ball on hit
                this.destroyBallWithTrail(releasedBall);
                this.checkSpawnNewSupplyBall();
            }
        });
        
        // Remove destroyed balls from array
        this.releasedBalls = this.releasedBalls.filter(ball => ball.active);
    }

    checkCollision(ball1, ball2, radius1, radius2) {
        if (!ball1.active || !ball2) return false;
        
        const dx = ball1.x - ball2.x;
        const dy = ball1.y - ball2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (radius1 + radius2);
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
            const radius = CONFIG.SUPPLY_BALL_RADIUS * progress;
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

    checkSpawnNewSupplyBall() {
        // Only spawn new ball if there's no ball currently rotating
        if (!this.supplyBall && this.pendingReleaseAngle !== undefined) {
            // Clear any old trail graphics
            if (this.oldBallTrailGraphics) {
                this.oldBallTrailGraphics.destroy();
                this.oldBallTrailGraphics = null;
            }
            
            this.currentAngle = this.pendingReleaseAngle;
            this.createSupplyBall();
            this.pendingReleaseAngle = undefined;
        }
    }

    releaseBall() {
        if (!this.supplyBall || this.supplyBall.isReleased) {
            return;
        }
        
        // Store the release position and angle
        const releaseAngle = this.currentAngle;
        
        // Calculate tangential velocity based on physics: v = ω × r
        const tangentialSpeed = this.rotationSpeed * this.rotationRadius;
        
        // Calculate tangential velocity direction (perpendicular to radius)
        const velocityX = -Math.sin(this.currentAngle) * tangentialSpeed;
        const velocityY = Math.cos(this.currentAngle) * tangentialSpeed;
        
        // Set velocity
        this.supplyBall.body.setVelocity(velocityX, velocityY);
        this.supplyBall.isReleased = true;
        
        // Add to released balls array for collision tracking
        this.releasedBalls.push(this.supplyBall);
        
        // Clear rope
        this.rope.clear();
        
        // Store release angle for new ball spawn
        this.pendingReleaseAngle = releaseAngle;
        
        // Remove reference to current ball
        this.supplyBall = null;
    }
}
