import cv2
import numpy as np
from cv2 import VideoCapture, imshow, waitKey, destroyAllWindows
from ultralytics import YOLO

# Create video capture object
capture = VideoCapture(0)
ultralyticsModel = YOLO("yolo11m-pose.pt")
frame_skip = 1
frame_id = 0
maxDrop = 0.45

BODY_NAMES = (
    "nose","l_eye","r_eye","l_ear","r_ear",
    "l_shoulder","r_shoulder","l_elbow","r_elbow",
)
SKELETON = [
    (6, 8), (8, 10), (5, 7), (7, 9)
]


# Check that a camera connection has been established
if not capture.isOpened():
    print("Error establishing connection")

while capture.isOpened():

    # Read an image frame
    validCapture, frame = capture.read()
    #add frame skip
    if frame_id % frame_skip == 0:
        #use model to get results and add those to a flattened keypoint 2d map
        results = ultralyticsModel.predict(frame, conf=0.25, verbose=False)
        keyPoints = results[0].keypoints.xy
        vis = frame.copy()

        #Slouch detection using midpoint ratio
        singlePersonKeyPoints = results[0].keypoints.xy[0]
        Lshoulder, Rshoulder, Nose = singlePersonKeyPoints[5], singlePersonKeyPoints[6], singlePersonKeyPoints[0]
        midX = (Lshoulder + Rshoulder) / 2
        dropRatio = abs(Nose[1] - midX[1]) / np.linalg.norm(Lshoulder - Rshoulder)
        if(dropRatio < maxDrop):
            #append json here
            cv2.putText(vis, "Slouch!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)


        #draws the skelton and person points
        for person in results[0].keypoints.xy:
            for x, y in person:
                cv2.circle(vis, (int(x), int(y)), 4, (255, 0, 0), -1)
            for i, j in SKELETON:
                x1, y1 = person[i]
                x2, y2 = person[j]
                cv2.line(vis, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)


        #draws frame
        cv2.imshow("Keypoints", vis)

    frame_id = frame_id + 1
    # If the Esc key is pressed, terminate the while loop
    if waitKey(25) == 27:
        break

# Release the video capture and close the display window
capture.release()
destroyAllWindows()

