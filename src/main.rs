use image::{GenericImageView, DynamicImage, GrayImage, ImageFormat};
use std::{thread, time::Duration, io::{self, Write, BufReader}};

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
    let new_width = 200;
    let delay_ms = 50;

    let file_in = std::fs::File::open(gif_path)?;
    let reader = BufReader::new(file_in);

    let decoder = image::ImageReader::new(reader)
        .with_guessed_format()?;

    let frames: Vec<DynamicImage> = match decoder.decode()? { // Call decode() here
        image::DecodingResult::Animation(animated_decoder) => {
            // It's an animated image (like a GIF)
            animated_decoder.frames().map(|f| {
                f.map(|frame| frame.into_rgba8().into_dynamic()).map_err(|e| e.into())
            }).collect::<Result<Vec<DynamicImage>, Box<dyn std::error::Error>>>()?
        },
        image::DecodingResult::Image(dynamic_image) => {
            // It's a static image
            vec![dynamic_image] // Just use the DynamicImage directly
        }
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