use actix_web::{web, App, HttpResponse, HttpServer, Error};
use actix_cors::Cors;
use actix_multipart::Multipart;
use futures_util::stream::StreamExt;
use image::{GenericImageView, DynamicImage, GrayImage};
use image::codecs::gif::GifDecoder;
use image::AnimationDecoder;
use std::io::Cursor;
use actix_web::error::{ErrorBadRequest, ErrorInternalServerError};

// caracteres ASCII
const ASCII_CHARS: &str = "@#WM&8%B$0QOZCLJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,^. ";

// redimensionamento da imagem original
fn resize_image(image: &DynamicImage, new_width: u32) -> DynamicImage {
    let (width, height) = image.dimensions();
    let ratio = (height as f32 / width as f32) / 1.65; // achatar a imagem
    let new_height = (new_width as f32 * ratio) as u32;
    image.resize_exact(new_width, new_height, image::imageops::FilterType::Lanczos3) //novas medidas
}

// contraste para a imagem ficar mais visivel
fn adjust_contrast(image: &DynamicImage, factor: f32) -> DynamicImage {
    let mut img: image::ImageBuffer<image::Rgba<u8>, Vec<u8>> = image.to_rgba8();
    for pixel in img.pixels_mut() {
        for i in 0..3 {
            let val = pixel[i] as f32;
            let new_val = ((val - 128.0) * factor + 128.0).clamp(0.0, 255.0);
            pixel[i] = new_val as u8;
        }
    }
    DynamicImage::ImageRgba8(img)
}
//transforma a imagem em preto e branco
fn grayify_image(image: &DynamicImage) -> GrayImage {
    image.to_luma8()
}

fn pixels_to_ascii(image: &GrayImage) -> String {
    let mut ascii_str = String::with_capacity((image.width() * image.height()) as usize);
    for pixel in image.pixels() {
        let intensity = pixel[0];
        let char_index: usize = (intensity as usize * (ASCII_CHARS.len() - 1)) / 255; //busca na string ascii qual o correspondente do indice de iluminosidade
        ascii_str.push(ASCII_CHARS.chars().nth(char_index).unwrap());
    }
    ascii_str
}

fn frame_to_ascii(image: &DynamicImage) -> String {
    let image_contrasted = adjust_contrast(image, 1.8);//determina o contraste com um fator de sombra
    let image_resized = resize_image(&image_contrasted, 200); // nova largura fixa 
    let image_gray = grayify_image(&image_resized);// deixa a imagem preto e branco
    let ascii_str = pixels_to_ascii(&image_gray);//analisa os pixel para transformar em ascii
    let img_width = image_gray.width() as usize;

    ascii_str //transforma em chunks, adiciona as quebras de linha e reconstroi a imagem
        .chars()
        .collect::<Vec<char>>()
        .chunks(img_width)
        .map(|chunk| chunk.iter().collect::<String>())
        .collect::<Vec<String>>()
        .join("\n")
}

async fn convert_image(mut payload: Multipart) -> Result<HttpResponse, Error> {
    let mut image_data = Vec::new();

    // Itera sobre os "campos" do formulário enviado (no nosso caso, só o campo 'image')
    while let Some(item) = payload.next().await {
        let mut field = item?;
        
        // Coleta os bytes do campo em um stream
        while let Some(chunk) = field.next().await {
            image_data.extend_from_slice(&chunk?);
        }
    }

    if image_data.is_empty() {
        return Ok(HttpResponse::BadRequest().body("Nenhum arquivo enviado."));
    }

    // Tenta carregar a imagem a partir dos bytes recebidos
    match image::load_from_memory(&image_data) {
        Ok(dynamic_image) => {
            // Se der certo, chama sua função de convers
            let ascii_art = frame_to_ascii(&dynamic_image);
            // E devolve a arte ASCII como resposta
            Ok(HttpResponse::Ok().content_type("text/plain").body(ascii_art))
        }
        Err(_) => {
            // Se não for uma imagem válida
            Ok(HttpResponse::BadRequest().body("Formato de arquivo inválido."))
        }
    }
}   

// ——————— handler para GIFs animados ———————
async fn convert_gif(mut payload: Multipart) -> Result<HttpResponse, Error> {
    let mut data = Vec::new();
    while let Some(item) = payload.next().await {
        let mut field = item?;
        while let Some(chunk) = field.next().await {
            data.extend_from_slice(&chunk?);
        }
    }
    if data.is_empty() {
        return Ok(HttpResponse::BadRequest().body("Nenhum arquivo enviado."));
    }

    let cursor = Cursor::new(&data);
    let decoder = GifDecoder::new(cursor)
        .map_err(|_| ErrorBadRequest("Não é um GIF válido."))?;  

    let frames = decoder.into_frames()
        .collect_frames()
        .map_err(|_| ErrorInternalServerError("Erro ao ler frames."))?;

    let ascii_frames: Vec<String> = frames.iter()
        .map(|frame| {
            let dyn_img = DynamicImage::ImageRgba8(frame.buffer().clone());
            frame_to_ascii(&dyn_img)
        })
        .collect();

    Ok(HttpResponse::Ok().json(&ascii_frames))
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
            .route("/api/convert-image", web::post().to(convert_image))
            .route("/api/convert-gif",   web::post().to(convert_gif))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}