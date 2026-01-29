// Shared config for dimensions and layout
var CONFIG = {
    // Game dimensions (portrait mode)
    GAME_WIDTH: 720,
    GAME_HEIGHT: 1280,

    // Rotation mechanics
    ROTATION_RADIUS: 120,       // Distance from axis to ball
    ROTATION_SPEED: 5,          // Angular speed in radians per second
    
    // Combat
    BALL_DAMAGE: 10,            // Damage dealt by ball to enemies
    
    // Ball properties
    BALL_RADIUS: 15,            // Visual size of ball
    BALL_COLOR: 0x4a90e2,       // Blue color for ball
    
    // Trail properties
    TRAIL_LENGTH: 15,           // Number of trail points
    TRAIL_COLOR: 0x4a90e2,      // Trail color (same as ball)
    TRAIL_MIN_ALPHA: 0.1,       // Minimum transparency at trail end
    TRAIL_MAX_ALPHA: 0.8,       // Maximum transparency at trail start
    
    // Axis properties
    AXIS_RADIUS: 10,            // Visual size of center axis
    AXIS_COLOR: 0x333333,       // Dark gray for axis
    
    // Enemy properties
    ENEMY_RADIUS: 30,           // Visual size of enemy
    ENEMY_COLOR: 0xff0000,      // Red color for enemy
    ENEMY_HP: 90,               // Starting HP for enemies
    
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
    
   
   
    RESET_PROGRESS : false,         // Set to true to clear saved progress on load
    
    // Color palette (kept for potential future use)
    SASHA_PALETTE: [
        { name: 'Red', hex: '#e6194b', tint: '#fad1da' },
        { name: 'Green', hex: '#3cb44b', tint: '#d8f0db' },
        { name: 'Blue', hex: '#4363d8', tint: '#d9e0f7' },
        { name: 'Orange', hex: '#f58231', tint: '#fde6d6' },
        { name: 'Purple', hex: '#911eb4', tint: '#e9d2f0' },
        { name: 'Teal', hex: '#469990', tint: '#daebe9' },
        { name: 'Olive', hex: '#808000', tint: '#e6e6cc' },
        { name: 'Magenta', hex: '#f032e6', tint: '#fcd6f6' },
        { name: 'Pink', hex: '#fabed4', tint: '#fef2f6' },
        { name: 'Lavender', hex: '#dcbeff', tint: '#f8f2ff' },
        { name: 'Beige', hex: '#fffac8', tint: '#fffef4' },
        { name: 'Maroon', hex: '#800000', tint: '#e6cccc' },
        { name: 'Mint', hex: '#aaffc3', tint: '#eefff3' },
        { name: 'Apricot', hex: '#ffd8b1', tint: '#fff7ef' },
        { name: 'Navy', hex: '#000075', tint: '#ccccdf' },
        { name: 'Grey', hex: '#a9a9a9', tint: '#eeeeee' },
        { name: 'Brown', hex: '#9a6324', tint: '#ebe0d3' },
        { name: 'Yellow', hex: '#ffe119', tint: '#fff9d1' },
        { name: 'Cyan', hex: '#42d4f4', tint: '#d9f6fd' },
        { name: 'Lime', hex: '#bfef45', tint: '#f2fccd' }
    ]
};
