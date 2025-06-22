import cv2
import numpy as np
from cv2 import VideoCapture, waitKey, destroyAllWindows
from hsemotion_onnx.facial_emotions import HSEmotionRecognizer
from ultralytics import YOLO


#VARIABLE DECLARATION
capture = VideoCapture(0)
ultralyticsModel = YOLO("yolo11m-pose.pt")
emotionalModel = HSEmotionRecognizer(model_name="enet_b0_8_best_afew")
net = cv2.dnn.readNetFromCaffe("deploy.prototxt",
                               "res10_300x300_ssd_iter_140000_fp16.caffemodel")
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

#MAIN LOOP
while capture.isOpened():
    # Read an image frame
    validCapture, frame = capture.read()
    #------------------FRAME PROCESSING-----------------
    if frame_id % frame_skip == 0:
        #Use model to get results and add those to a flattened keypoint 2d map
        results = ultralyticsModel.predict(frame, conf=0.25, verbose=False)
        keyPoints = results[0].keypoints.xy
        vis = frame.copy()

        #------------------SLOUCH DETECTION-----------------
        singlePersonKeyPoints = results[0].keypoints.xy[0]
        Lshoulder, Rshoulder, Nose = singlePersonKeyPoints[5], singlePersonKeyPoints[6], singlePersonKeyPoints[0]
        midX = (Lshoulder + Rshoulder) / 2
        dropRatio = abs(Nose[1] - midX[1]) / np.linalg.norm(Lshoulder - Rshoulder)
        if(dropRatio < maxDrop):
            #append json here
            cv2.putText(vis, "Slouch!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # ------------------FACIAL DETECTION -----------------
        #Make the frame for the face shape and make a blob for openCV
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300),
                                     (104, 117, 123), False, False)
        net.setInput(blob)
        detections = net.forward()

        #Detect the face with the given bounds
        for i in range(detections.shape[2]):
            conf = float(detections[0, 0, i, 2])
            if conf < 0.5:
                continue
            # Get bounding box in original frame coords
            x1 = int(detections[0, 0, i, 3] * w)
            y1 = int(detections[0, 0, i, 4] * h)
            x2 = int(detections[0, 0, i, 5] * w)
            y2 = int(detections[0, 0, i, 6] * h)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)

            face = frame[y1:y2, x1:x2]
            if face.size == 0:
                continue
            #Evaulte data with the HSemotions model and output into variables
            label, scores = emotionalModel.predict_emotions(face[:, :, ::-1], logits=False)
            order = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']
            conf_emotion = float(scores[order.index(label.lower())])
            #append json here
            break

        #------------------SKELETON RENDERING -----------------
        for person in results[0].keypoints.xy:
            for x, y in person:
                cv2.circle(vis, (int(x), int(y)), 4, (255, 0, 0), -1)
        cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(vis, f"{label}:{conf:.2f}", (x1, y2 + 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)



        #draws frame
        cv2.imshow("Keypoints", vis)
    # ------------------FRAME RENDERING-----------------
    frame_id = frame_id + 1
    if waitKey(25) == 27:
        break

# Release the video capture and close the display window
capture.release()
destroyAllWindows()