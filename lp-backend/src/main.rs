
use actix_web::{web, App, HttpResponse, HttpServer, Error};
use actix_cors::Cors;
use actix_multipart::Multipart;
use futures_util::stream::StreamExt;
use image::{GenericImageView, DynamicImage, GrayImage, ImageFormat, RgbaImage};
use std::{str::FromStr, io::Cursor};
use bytes::Bytes;
use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};
use tokio_stream::wrappers::ReceiverStream;

const ASCII_CHARS: &str = " .:-=+*!DRB#";

fn resize_image(image: &DynamicImage, new_width: u32) -> DynamicImage {
    let (width, height) = image.dimensions();
    let ratio = (height as f32 / width as f32) / 1.65;
    let new_height = (new_width as f32 * ratio) as u32;
    image.resize_exact(new_width, new_height, image::imageops::FilterType::Lanczos3)
}

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

fn grayify_image(image: &DynamicImage) -> GrayImage {
    image.to_luma8()
}

fn pixels_to_ascii(image: &GrayImage) -> String {
    let mut ascii_str = String::with_capacity((image.width() * image.height()) as usize);
    for pixel in image.pixels() {
        let intensity = pixel[0];
        let char_index = (intensity as usize * (ASCII_CHARS.len() - 1)) / 255;
        ascii_str.push(ASCII_CHARS.chars().nth(char_index).unwrap());
    }
    ascii_str
}

fn frame_to_ascii(image: &DynamicImage, new_width: u32) -> String {
    let image_contrasted = adjust_contrast(image, 1.8);
    let image_resized = resize_image(&image_contrasted, new_width);
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

async fn convert_real(mut payload: Multipart) -> Result<HttpResponse, Error> {
    let mut image_data = Vec::new();
    let mut width_str = String::from("200");

    while let Some(item) = payload.next().await {
        let mut field = item?;
        let field_name = match field.content_disposition() {
            Some(cd) => cd.get_name().unwrap_or("").to_string(),
            None => "".to_string(),
        };
        let mut field_data = Vec::new();
        while let Some(chunk) = field.next().await {
            field_data.extend_from_slice(&chunk?);
        }
        if field_name == "image" { image_data = field_data; }
        else if field_name == "width" {
            if let Ok(s) = String::from_utf8(field_data) { width_str = s; }
        }
    }

    let ascii_width = u32::from_str(&width_str).unwrap_or(200);
    if image_data.is_empty() { return Ok(HttpResponse::BadRequest().body("Nenhum arquivo enviado.")); }

    let image_format = image::guess_format(&image_data).unwrap_or(ImageFormat::Png);

    if image_format == ImageFormat::Gif {
        let (tx, rx) = mpsc::channel::<Result<Bytes, Error>>(10);
        let stream = ReceiverStream::new(rx);

        actix_web::rt::spawn(async move {
            let cursor = Cursor::new(image_data);
            if let Ok(mut decoder) = gif::Decoder::new(cursor) {
                
                while let Ok(Some(frame)) = decoder.read_next_frame() {
                    let delay = Duration::from_millis(frame.delay as u64 * 10);
                    
                    if let Some(rgba_image) = RgbaImage::from_raw(frame.width as u32, frame.height as u32, frame.buffer.clone().into_owned()) {
                        let dynamic_image = DynamicImage::ImageRgba8(rgba_image);
                        let ascii_frame = frame_to_ascii(&dynamic_image, ascii_width);
                        
                        let sse_message = format!("data: {}\n\n", serde_json::to_string(&ascii_frame).unwrap());
                        
                        if tx.send(Ok(Bytes::from(sse_message))).await.is_err() {
                            break;
                        }
                    }
                    sleep(delay).await;
                }
            }
            let _ = tx.send(Ok(Bytes::from("event: end\ndata: done\n\n"))).await;
        });

        Ok(HttpResponse::Ok()
            .content_type("text/event-stream")
            .keep_alive()
            .streaming(stream))

    } else {
        match image::load_from_memory(&image_data) {
            Ok(dynamic_image) => {
                let ascii_art = frame_to_ascii(&dynamic_image, ascii_width);
                Ok(HttpResponse::Ok().content_type("text/plain").body(ascii_art))
            }
            Err(_) => Ok(HttpResponse::BadRequest().body("Formato de arquivo inválido.")),
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Servidor backend rodando em http://127.0.0.1:8080");
    HttpServer::new(|| {
        let cors = Cors::default()
              .allowed_origin("http://localhost:3000")
              .allowed_methods(vec!["GET", "POST"])
              .allow_any_header()
              .max_age(3600);
        App::new()
            .wrap(cors)
            .route("/api/convert", web::post().to(convert_real))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}