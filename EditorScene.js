// EditorScene.js - Level editor to position axis, enemies, and configure parameters
class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x222222, 0.3).setOrigin(0, 0);
        
        // Title
        this.add.text(width / 2, 30, 'LEVEL EDITOR', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Initialize editor state
        this.axisX = 360;
        this.axisY = 1000;
        this.rotationRadius = CONFIG.ROTATION_RADIUS;
        this.rotationSpeed = CONFIG.ROTATION_SPEED;
        this.enemies = [{ x: 360, y: 300, hp: CONFIG.ENEMY_HP }];
        
        // Create draggable axis
        this.createAxis();
        
        // Create draggable enemies
        this.enemyObjects = [];
        this.createEnemies();
        
        // Rotating ball preview
        this.currentAngle = 0;
        this.rope = this.add.graphics();
        this.createBallPreview();
        
        // UI Panel
        this.createUI();
        
        // Back to game button
        const backBtn = this.add.text(20, 20, '← BACK', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 }
        });
        backBtn.setOrigin(0, 0);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
            this.scene.start('MainGameScene', { levelIndex: 0 });
        });
    }

    createAxis() {
        this.axis = this.add.circle(this.axisX, this.axisY, CONFIG.AXIS_RADIUS, CONFIG.AXIS_COLOR);
        this.axis.setInteractive({ draggable: true, useHandCursor: true });
        
        // Axis label
        this.axisLabel = this.add.text(this.axisX, this.axisY - 30, 'AXIS', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        });
        this.axisLabel.setOrigin(0.5, 1);
        
        this.axis.on('drag', (pointer, dragX, dragY) => {
            this.axisX = dragX;
            this.axisY = dragY;
            this.axis.setPosition(dragX, dragY);
            this.axisLabel.setPosition(dragX, dragY - 30);
        });
    }

    createEnemies() {
        this.enemyObjects.forEach(obj => {
            obj.circle.destroy();
            obj.label.destroy();
        });
        this.enemyObjects = [];
        
        this.enemies.forEach((enemyData, index) => {
            const enemy = this.add.circle(enemyData.x, enemyData.y, CONFIG.ENEMY_RADIUS, CONFIG.ENEMY_COLOR);
            enemy.setInteractive({ draggable: true, useHandCursor: true });
            
            const label = this.add.text(enemyData.x, enemyData.y, `HP: ${enemyData.hp}`, {
                fontFamily: CONFIG.FONT_FAMILY,
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            label.setOrigin(0.5, 0.5);
            
            enemy.on('drag', (pointer, dragX, dragY) => {
                this.enemies[index].x = dragX;
                this.enemies[index].y = dragY;
                enemy.setPosition(dragX, dragY);
                label.setPosition(dragX, dragY);
            });
            
            this.enemyObjects.push({ circle: enemy, label: label, index: index });
        });
    }

    createBallPreview() {
        const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
        const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
        
        this.ballPreview = this.add.circle(ballX, ballY, CONFIG.BALL_RADIUS, CONFIG.BALL_COLOR);
    }

    createUI() {
        const { width, height } = this.sys.game.canvas;
        const panelX = 20;
        const panelY = height - 420;
        
        // Panel background
        const panel = this.add.rectangle(panelX, panelY, 320, 400, 0x333333, 0.9);
        panel.setOrigin(0, 0);
        
        let yOffset = panelY + 20;
        
        // Rotation Radius
        this.add.text(panelX + 20, yOffset, 'Rotation Radius:', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '18px',
            color: '#ffffff'
        });
        yOffset += 30;
        
        this.radiusText = this.add.text(panelX + 20, yOffset, this.rotationRadius.toString(), {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '16px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        const radiusMinus = this.createButton(panelX + 160, yOffset, '-', () => {
            this.rotationRadius = Math.max(50, this.rotationRadius - 10);
            this.radiusText.setText(this.rotationRadius.toString());
        });
        
        const radiusPlus = this.createButton(panelX + 220, yOffset, '+', () => {
            this.rotationRadius = Math.min(300, this.rotationRadius + 10);
            this.radiusText.setText(this.rotationRadius.toString());
        });
        
        yOffset += 50;
        
        // Rotation Speed
        this.add.text(panelX + 20, yOffset, 'Rotation Speed:', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '18px',
            color: '#ffffff'
        });
        yOffset += 30;
        
        this.speedText = this.add.text(panelX + 20, yOffset, this.rotationSpeed.toFixed(1), {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '16px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        const speedMinus = this.createButton(panelX + 160, yOffset, '-', () => {
            this.rotationSpeed = Math.max(0.5, this.rotationSpeed - 0.5);
            this.speedText.setText(this.rotationSpeed.toFixed(1));
        });
        
        const speedPlus = this.createButton(panelX + 220, yOffset, '+', () => {
            this.rotationSpeed = Math.min(10, this.rotationSpeed + 0.5);
            this.speedText.setText(this.rotationSpeed.toFixed(1));
        });
        
        yOffset += 50;
        
        // Enemy HP
        this.add.text(panelX + 20, yOffset, 'Enemy HP:', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '18px',
            color: '#ffffff'
        });
        yOffset += 30;
        
        this.hpText = this.add.text(panelX + 20, yOffset, this.enemies[0].hp.toString(), {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '16px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        const hpMinus = this.createButton(panelX + 160, yOffset, '-', () => {
            this.enemies[0].hp = Math.max(10, this.enemies[0].hp - 10);
            this.hpText.setText(this.enemies[0].hp.toString());
            this.createEnemies();
        });
        
        const hpPlus = this.createButton(panelX + 220, yOffset, '+', () => {
            this.enemies[0].hp = Math.min(500, this.enemies[0].hp + 10);
            this.hpText.setText(this.enemies[0].hp.toString());
            this.createEnemies();
        });
        
        yOffset += 60;
        
        // Copy JSON Button
        const copyBtn = this.add.text(panelX + 160, yOffset, 'COPY JSON', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 15, y: 10 }
        });
        copyBtn.setOrigin(0.5, 0);
        copyBtn.setInteractive({ useHandCursor: true });
        copyBtn.on('pointerdown', () => {
            this.copyLevelJSON();
        });
        
        yOffset += 50;
        
        // Status text for copy feedback
        this.statusText = this.add.text(panelX + 160, yOffset, '', {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '14px',
            color: '#00ff00'
        });
        this.statusText.setOrigin(0.5, 0);
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: CONFIG.FONT_FAMILY,
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#4a90e2',
            padding: { x: 15, y: 5 }
        });
        btn.setOrigin(0.5, 0);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', callback);
        return btn;
    }

    update(time, delta) {
        // Animate ball preview
        this.currentAngle += this.rotationSpeed * (delta / 1000);
        
        const ballX = this.axisX + Math.cos(this.currentAngle) * this.rotationRadius;
        const ballY = this.axisY + Math.sin(this.currentAngle) * this.rotationRadius;
        
        this.ballPreview.setPosition(ballX, ballY);
        
        // Draw rope
        this.rope.clear();
        this.rope.lineStyle(CONFIG.ROPE_WIDTH, CONFIG.ROPE_COLOR);
        this.rope.lineBetween(this.axisX, this.axisY, ballX, ballY);
    }

    copyLevelJSON() {
        const levelData = {
            levelNumber: 1,
            axisPosition: {
                x: Math.round(this.axisX),
                y: Math.round(this.axisY)
            },
            rotationRadius: this.rotationRadius,
            rotationSpeed: this.rotationSpeed,
            enemies: this.enemies.map(e => ({
                x: Math.round(e.x),
                y: Math.round(e.y),
                hp: e.hp
            }))
        };
        
        const jsonString = JSON.stringify(levelData, null, 4);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonString).then(() => {
                this.statusText.setText('Copied to clipboard!');
                this.time.delayedCall(2000, () => {
                    this.statusText.setText('');
                });
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.showJSONInConsole(jsonString);
            });
        } else {
            this.showJSONInConsole(jsonString);
        }
    }

    showJSONInConsole(jsonString) {
        console.log('=== LEVEL JSON ===');
        console.log(jsonString);
        console.log('=== END LEVEL JSON ===');
        this.statusText.setText('Check console!');
        this.time.delayedCall(2000, () => {
            this.statusText.setText('');
        });
    }
}
