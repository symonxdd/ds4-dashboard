use tauri::image::Image;

fn set_pixel(buf: &mut [u8], x: u32, y: u32, r: u8, g: u8, b: u8, a: u8) {
    if x < 32 && y < 32 {
        let idx = ((y * 32 + x) * 4) as usize;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = a;
    }
}

/// Checks if a pixel (x, y) is within the gauge arc shape.
/// The arc is centered at (16, 16) with a 240-degree span.
fn is_gauge_arc_shape(x: f32, y: f32, inner_r: f32, outer_r: f32) -> bool {
    let dx = x - 15.5; // Offset slightly for 32x32 center
    let dy = y - 15.5;
    let dist_sq = dx * dx + dy * dy;
    
    if dist_sq < inner_r * inner_r || dist_sq > outer_r * outer_r {
        return false;
    }

    // Angle calculation (0 is right, goes clockwise)
    // We want a 240 degree arc centered at the top.
    // So it goes from 150 to 390 (or -210 to 30).
    let angle = dy.atan2(dx).to_degrees(); // -180 to 180
    
    // The "gap" is at the bottom (60 degrees each side of 90)
    // For a 240-degree arc, the gap should be 120 degrees (30 to 150).
    !(angle > 30.0 && angle < 150.0)
}

pub fn generate_battery_icon_raw(percentage: u8, charging: bool, connected: bool) -> Vec<u8> {
    let mut buf = vec![0u8; 32 * 32 * 4];

    // Colors (Matched to UI)
    let color_bg = (60, 60, 60, 255); // Dark grey track
    let color_fill_normal = (34, 197, 94, 255); // Green (#22c55e)
    let color_fill_mid = (234, 179, 8, 255);    // Yellow (#eab308)
    let color_fill_low = (239, 68, 68, 255);    // Red (#ef4444)
    let color_fill_charge = (56, 189, 248, 255); // Sky Blue (#38bdf8)
    let color_empty = (100, 100, 100, 255);     // Grey for disconnected

    let fill_color = if !connected {
        color_empty
    } else if charging {
        color_fill_charge
    } else if percentage > 70 {
        color_fill_normal
    } else if percentage > 30 {
        color_fill_mid
    } else {
        color_fill_low
    };

    // Arc parameters
    let inner_r = 9.0;
    let outer_r = 13.0;

    // The arc starts at 120 degrees and goes clockwise for 240 degrees to 60 degrees.
    // 120 (bottom-rightish) -> 180 -> -180 -> -60 -> 0 -> 60 (bottom-leftish)
    // Wait, let's simplify: 
    // Gap is 120 degrees at bottom (30 to 150 if 90 is bottom).
    // Or just say: Valid if angle NOT in (60, 120).
    
    // Calculate fill threshold angle
    // 0% -> 120 degrees (start)
    // 100% -> 60 degrees (end)
    // Total sweep is 240 degrees clockwise.
    let sweep = 240.0;
    let start_angle = 150.0; // Starting from bottom right of the arc

    for y in 0..32 {
        for x in 0..32 {
            if is_gauge_arc_shape(x as f32, y as f32, inner_r, outer_r) {
                let dx = x as f32 - 15.5;
                let dy = y as f32 - 15.5;
                let angle = dy.atan2(dx).to_degrees();
                
                // Normalize angle to be relative to start_angle (120) moving clockwise
                // We want a range from 0 to 240.
                let mut rel_angle = angle - start_angle;
                while rel_angle < 0.0 { rel_angle += 360.0; }
                
                if connected && rel_angle <= (percentage as f32 / 100.0) * sweep {
                    set_pixel(&mut buf, x, y, fill_color.0, fill_color.1, fill_color.2, 255);
                } else {
                    // Background track
                    set_pixel(&mut buf, x, y, color_bg.0, color_bg.1, color_bg.2, 180);
                }
            }
        }
    }

    if charging && connected {
        // Draw a tiny lightning bolt in the center
        let pixels = [
            (16, 13), (17, 13),
            (15, 14), (16, 14),
            (14, 15), (15, 15), (16, 15), (17, 15),
            (15, 16), (16, 16),
            (14, 17), (15, 17),
            (14, 18),
        ];
        for &(px, py) in &pixels {
            set_pixel(&mut buf, px, py, 255, 255, 255, 255);
        }
    } else if !connected {
        // Draw an 'X' in the center
        let x_pixels = [
            (14, 14), (17, 14),
            (15, 15), (16, 15),
            (15, 16), (16, 16),
            (14, 17), (17, 17),
        ];
        for &(px, py) in &x_pixels {
            set_pixel(&mut buf, px, py, color_empty.0, color_empty.1, color_empty.2, 255);
        }
    }

    buf
}

pub fn generate_battery_icon(percentage: u8, charging: bool, connected: bool) -> Image<'static> {
    Image::new_owned(
        generate_battery_icon_raw(percentage, charging, connected),
        32,
        32,
    )
}
