from PIL import Image

# Caracters ASCII do mais escuro para o mais claro
ASCII_CHARS = "@%#*+=-:. "
def resize_image(image, new_width=100):
    width, height = image.size
    ratio = height / width / 1.65  # ajuste vertical
    new_height = int(new_width * ratio)
    return image.resize((new_width, new_height))

def grayify(image):
    return image.convert("L")  # converte para escala de cinza

def pixels_to_ascii(image):
    pixels = image.getdata()
    ascii_str = ""
    for pixel in pixels:
        # Mapeamento proporcional
        ascii_str += ASCII_CHARS[pixel * (len(ASCII_CHARS) - 1) // 255]
    return ascii_str

def main(path, new_width=100):
    try:
        image = Image.open(path)
    except Exception as e:
        print("Não foi possível abrir a imagem:", e)
        return

    image = resize_image(image, new_width)
    image = grayify(image)

    ascii_str = pixels_to_ascii(image)
    img_width = image.width
    ascii_art = ""
    for i in range(0, len(ascii_str), img_width):
        ascii_art += ascii_str[i:i+img_width] + "\n"

    # Salva em um arquivo ou imprime
    with open("ascii_art.txt", "w") as f:
        f.write(ascii_art)

    print(ascii_art)

# Use
main("images.jpg", new_width=100)
