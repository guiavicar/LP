import cv2
import numpy as np
import sys
import time


ASCII_CHARS = ".'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"

def frame_to_ascii_color(frame, new_width=150):
    height, width, _ = frame.shape
    ratio = height / width / 1.65
    new_height = int(new_width * ratio)
    resized = cv2.resize(frame, (new_width, new_height))

    ascii_str = ""
    for row in resized:
        for pixel in row:
            b, g, r = pixel
            # calcula o brilho para escolher o caractere
            gray = int(0.2989 * r + 0.5870 * g + 0.1140 * b)
            char = ASCII_CHARS[int(gray * (len(ASCII_CHARS) - 1) / 255)]
            # imprime com cor ANSI RGB
            ascii_str += f"\033[38;2;{r};{g};{b}m{char}\033[0m"
        ascii_str += "\n"
    return ascii_str

def main(new_width=150, delay=0.001):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Não consegui acessar a webcam.")
        return

    print("\033[2J")
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            ascii_frame = frame_to_ascii_color(frame, new_width)
            sys.stdout.write("\033[H" + ascii_frame)
            sys.stdout.flush()
            time.sleep(delay)

            # ESC pra sair na janela do opencv (caso queira debug)
            if cv2.waitKey(1) & 0xFF == 27:
                break
                        # Mostra preview original da webcam
            cv2.imshow("Webcam Preview", frame)

            ascii_frame = frame_to_ascii_color(frame, new_width)
            sys.stdout.write("\033[H" + ascii_frame)
            sys.stdout.flush()
            time.sleep(delay)

            # Para poder fechar a janela com ESC
            if cv2.waitKey(1) & 0xFF == 27:
                break
    except KeyboardInterrupt:
        pass
    finally:
        cap.release()
        print("\nWebcam finalizada.")

main()
