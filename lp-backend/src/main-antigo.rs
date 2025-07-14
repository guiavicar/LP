use image::{GenericImageView, DynamicImage, GrayImage, ImageFormat, RgbaImage};
use std::{thread, time::Duration, io::{self, Write, BufReader}};
use gif::Decoder as GifDecoder;

const ASCII_CHARS: &str = "#BRD!*+=-:. ";

// Function to resize the image
fn resize_image(image: &DynamicImage, new_width: u32) -> DynamicImage {
    let (width, height) = image.dimensions();
    let ratio = (height as f32 / width as f32) / 1.65;
    let new_height = (new_width as f32 * ratio) as u32;
    image.resize_exact(new_width, new_height, image::imageops::FilterType::Lanczos3)
}

// Function to adjust contrast
fn adjust_contrast(image: &DynamicImage, factor: f32) -> DynamicImage {
    let mut img = image.to_rgba8();
    for pixel in img.pixels_mut() {
        for i in 0..3 {
            let val = pixel[i] as f32;
            let new_val = ((val - 128.0) * factor + 128.0).clamp(0.0, 255.0);
            pixel[i] = new_val as u8;
        }
    }
    DynamicImage::ImageRgba8(img)
}

// Function to convert to grayscale
fn grayify_image(image: &DynamicImage) -> GrayImage {
    image.to_luma8()
}

// Function to convert pixels to ASCII characters
fn pixels_to_ascii(image: &GrayImage) -> String {
    let mut ascii_str = String::with_capacity((image.width() * image.height()) as usize);
    for pixel in image.pixels() {
        let intensity = pixel[0];
        let char_index = (intensity as usize * (ASCII_CHARS.len() - 1)) / 255;
        ascii_str.push(ASCII_CHARS.chars().nth(char_index).unwrap());
    }
    ascii_str
}

// Function to process a single image frame into ASCII art
fn frame_to_ascii(image: &DynamicImage) -> String {
    let image_contrasted = adjust_contrast(image, 1.8);
    let image_resized = resize_image(&image_contrasted, 200);
    let image_gray = grayify_image(&image_resized);
    let ascii_str = pixels_to_ascii(&image_gray);
    let img_width = image_gray.width() as usize;

    ascii_str
        .chars()
        .collect::<Vec<char>>()
        .chunks(img_width)
        .map(|chunk| chunk.iter().collect::<String>())
        .collect::<Vec<String>>()
        .join("\n")
}

// Main function to open GIF, process frames, and display animation
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let gif_path = "./cruzeiro.gif";
    let _new_width = 200; // Renamed to _new_width to silence the warning
    let delay_ms = 50;

    let file = std::fs::File::open(gif_path)?;
    let mut reader = BufReader::new(file);

    let format = image::ImageReader::new(&mut reader)
        .with_guessed_format()?
        .format();

    let mut frames: Vec<DynamicImage> = Vec::new(); // Initialize an empty vector for frames

    if let Some(ImageFormat::Gif) = format {
        // If it's a GIF, specifically try to decode as an animation
        let file_animated = std::fs::File::open(gif_path)?;
        let reader_animated = BufReader::new(file_animated);
        
        let mut decoder = GifDecoder::new(reader_animated)?;

        // Corrected: Copy the global palette data so it's owned, not borrowed from decoder
        let global_palette_data = decoder.palette()
                                        .map(|p| p.to_vec()) // Convert &[u8] to Vec<u8>
                                        .unwrap_or_default(); // Default to empty Vec if no palette

        while let Some(frame) = decoder.read_next_frame()? {
            let (width, height) = (frame.width as u32, frame.height as u32);

            let mut rgba_buffer = Vec::with_capacity((width * height * 4) as usize);
            
            // Use the frame's local palette if it has one, otherwise use the owned global_palette_data
            let current_palette: &[u8] = match frame.palette.as_ref() {
                Some(p) => p.as_slice(), // If frame has local palette (Vec<u8>), get its slice &[u8]
                None => &global_palette_data, // Use reference to the owned global palette data
            };

            // Handle transparency: get the transparent color index if present
            let transparent_idx = frame.transparent;

            for &pixel_idx in frame.buffer.iter() {
                let color_idx = pixel_idx as usize * 3; // Palette stores R, G, B for each entry
                if color_idx + 2 < current_palette.len() {
                    rgba_buffer.push(current_palette[color_idx]);     // R
                    rgba_buffer.push(current_palette[color_idx + 1]); // G
                    rgba_buffer.push(current_palette[color_idx + 2]); // B
                    
                    // Apply transparency
                    if let Some(t_idx) = transparent_idx {
                        if pixel_idx == t_idx {
                            rgba_buffer.push(0); // Transparent (A = 0)
                        } else {
                            rgba_buffer.push(255); // Opaque (A = 255)
                        }
                    } else {
                        rgba_buffer.push(255); // No transparency, fully opaque
                    }
                } else {
                    // Fallback for out-of-bounds palette index
                    rgba_buffer.extend_from_slice(&[0, 0, 0, 255]); // Black opaque pixel
                }
            }

            let img_buffer = RgbaImage::from_raw(width, height, rgba_buffer)
                .ok_or("Failed to create RgbaImage from converted buffer")?;
            
            frames.push(image::DynamicImage::ImageRgba8(img_buffer));
        }
    } else {
        // If it's not a GIF (or a static image), decode as a single image
        let file_static = std::fs::File::open(gif_path)?;
        let reader_static = BufReader::new(file_static);
        let decoder_static = image::ImageReader::new(reader_static)
            .with_guessed_format()?;

        frames.push(decoder_static.decode()?);
    };
    
    let ascii_frames: Vec<String> = frames.iter()
        .map(|frame| frame_to_ascii(&frame))
        .collect();

    let clear_screen = "\x1b[H\x1b[2J"; 

    println!("Pressione Ctrl+C para encerrar a animação.");

    loop {
        for frame in &ascii_frames {
            print!("{}{}", clear_screen, frame);
            io::stdout().flush()?;
            thread::sleep(Duration::from_millis(delay_ms));
        }
    }
}