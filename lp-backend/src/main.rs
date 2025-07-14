use actix_web::{web, App, HttpResponse, HttpServer, Responder, Error};
use actix_cors::Cors;
use actix_multipart::Multipart;
use futures_util::stream::StreamExt;
use image::{GenericImageView, DynamicImage, GrayImage, ImageFormat, RgbaImage};

// =========================================================================
// === SUAS FUNÇÕES DE PROCESSAMENTO DE IMAGEM (COPIADAS DO CÓDIGO ANTIGO) ===
// =========================================================================

const ASCII_CHARS: &str = "#BRD!*+=-:. ";

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

// =========================================================================
// === NOVO HANDLER PARA UPLOAD E CONVERSÃO REAL ===
// =========================================================================

async fn convert_real(mut payload: Multipart) -> Result<HttpResponse, Error> {
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
            // Se der certo, chama sua função de conversão!
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

// =========================================================================
// === FUNÇÃO MAIN ATUALIZADA ===
// =========================================================================

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
            // IMPORTANTE: A rota agora aceita POST e chama a nova função `convert_real`
            .route("/api/convert", web::post().to(convert_real))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}