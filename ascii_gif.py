import sys
import time
from PIL import Image, ImageSequence, ImageEnhance

#ASCII_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
ASCII_CHARS = "#BRD!*+=-:. "
def redimencao(image, new_width=200):
    width, height = image.size
    ratio = height / width / 1.65
    new_height = int(new_width * ratio)
    return image.resize((new_width, new_height))

def contraste(image, factor=1.8):
    enhancer = ImageEnhance.Contrast(image)
    return enhancer.enhance(factor)

def grayify(image):
    return image.convert("L")

def pixels_to_ascii(image):
    pixels = image.getdata()
    ascii_str = "".join([ASCII_CHARS[p * (len(ASCII_CHARS)-1) // 255] for p in pixels])
    return ascii_str

def frame_to_ascii(image):
    image = contraste(image)
    image = redimencao(image)
    image = grayify(image)
    ascii_str = pixels_to_ascii(image)
    img_width = image.width
    return "\n".join([ascii_str[i:i+img_width] for i in range(0, len(ascii_str), img_width)])

def main(gif_path, new_width=600, delay=0.1):
    gif = Image.open(gif_path)
    frames = [frame_to_ascii(frame.convert("RGBA")) for frame in ImageSequence.Iterator(gif)]
    
    try:
        while True:
            for frame in frames:
                print("\033[H" + frame)
                time.sleep(delay)
    except KeyboardInterrupt:
        print("\nAnimação encerrada.")

# Use assim
main("cruzeiro.gif", new_width=200, delay=0.05)