from time import sleep

from cv2 import VideoCapture, imshow

caputre = VideoCapture(0)
ret = False


if not caputre.isOpened():
    print("No picture")

ret, frame = caputre.read()
if ret:
    imshow("image", frame)
    sleep(3000000)