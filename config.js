// Shared config for dimensions and layout
var CONFIG = {
    // Game dimensions (portrait mode)
    GAME_WIDTH: 720,
    GAME_HEIGHT: 1280,

    // Rotation mechanics
    ROTATION_RADIUS: 120,       // Distance from axis to ball
    ROTATION_SPEED: 5,          // Angular speed in radians per second
    
    // Combat System
    PLAYER_START_DAMAGE: 100,   // Player's starting damage
    ENEMY_START_HP: 500,        // First enemy's HP
    ATTACK_INTERVAL: 2000,      // Attack every 2000ms (2 seconds)
    ATTACK_DISTANCE: 20,        // How far player moves during attack animation
    ATTACK_DURATION: 50,        // Attack animation duration in ms (fast punch)
    
    // Supply Ball Damage by Level (1-20)
    SUPPLY_BALL_DAMAGE: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
    
    // Enemy HP by Level (1-20)
    ENEMY_HP_BY_LEVEL: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000],
    
    // Enemy Colors for variety
    ENEMY_COLORS: [0xff0000, 0xff4500, 0xff6347, 0xff7f50, 0xffa500, 0xffb347, 0xffc04d, 0xffd700, 0xffdf00, 0xffed4e, 0x32cd32, 0x00fa9a, 0x00ced1, 0x1e90ff, 0x4169e1, 0x8a2be2, 0x9370db, 0xba55d3, 0xff1493, 0xff69b4],
    
    // Ball properties
    BALL_RADIUS: 30,            // Visual size of fighter/enemy balls
    PLAYER_COLOR: 0x4a90e2,     // Blue for player
    BALL_COLOR: 0x4a90e2,       // Blue color for supply balls (rotating)
    
    // Trail properties
    TRAIL_LENGTH: 15,           // Number of trail points
    TRAIL_COLOR: 0x4a90e2,      // Trail color (same as ball)
    TRAIL_MIN_ALPHA: 0.1,       // Minimum transparency at trail end
    TRAIL_MAX_ALPHA: 0.8,       // Maximum transparency at trail start
    
    // Axis properties
    AXIS_RADIUS: 10,            // Visual size of center axis
    AXIS_COLOR: 0x333333,       // Dark gray for axis
    
    // Supply ball properties
    SUPPLY_BALL_RADIUS: 15,     // Visual size of rotating supply ball
    
    // Rope/line properties
    ROPE_COLOR: 0xffffff,       // White color for rope
    ROPE_WIDTH: 2,              // Line thickness
    
    // Physics
    BALL_VELOCITY_MULTIPLIER: 300,  // Speed when ball is released

    // Debug settings
    DEBUG_BOUNDARY: true,       // Show portrait boundary and rotation area
    ROTATION_AREA_COLOR: 0xffa756,  // Light cyan for rotation area
    ROTATION_AREA_ALPHA: 0.15,      // Transparency of rotation area

    FONT_FAMILY: 'Arial',
    TEXT_COLOR: '#333333',
    
    RESET_PROGRESS : false         // Set to true to clear saved progress on load
};
