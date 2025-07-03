import cv2
import numpy as np
import sys
import time

ASCII_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"

def preprocess_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    return gray

def frame_to_ascii(frame, new_width=160):
    gray = preprocess_frame(frame)
    height, width = gray.shape
    ratio = height / width / 1.65
    new_height = int(new_width * ratio)
    resized = cv2.resize(gray, (new_width, new_height))

    ascii_str = ""
    for row in resized:
        for pixel in row:
            ascii_str += ASCII_CHARS[int(pixel * (len(ASCII_CHARS) - 1) / 255)]
        ascii_str += "\n"
    return ascii_str
'''
def main(new_width=160, delay=0.03):
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

            ascii_frame = frame_to_ascii(frame, new_width)
            sys.stdout.write("\033[H" + ascii_frame)
            sys.stdout.flush()
            time.sleep(delay)

    except KeyboardInterrupt:
        pass
    finally:
        cap.release()
        print("\nWebcam finalizada.")'''

def main(new_width=160, delay=0.03):
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

            # Mostra preview original da webcam
            cv2.imshow("Webcam Preview", frame)

            ascii_frame = frame_to_ascii(frame, new_width)
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
        cv2.destroyAllWindows()
        print("\nWebcam finalizada.")

main()
