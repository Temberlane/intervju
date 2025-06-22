from multiprocessing.spawn import import_main_path
import numpy as np
import cv2
from cv2 import VideoCapture
from hsemotion_onnx.facial_emotions import HSEmotionRecognizer
from ultralytics import YOLO
import json


#Default drop is 0.45
class frameCapture:
    def __init__(self, maxDrop):
        isSlouched = False
        expression = ""
        ultralyticsModel = YOLO("yolo11m-pose.pt")
        emotionalModel = HSEmotionRecognizer(model_name="enet_b0_8_best_afew")
        net = cv2.dnn.readNetFromCaffe("deploy.prototxt", "res10_300x300_ssd_iter_140000_fp16.caffemodel")
        BODY_NAMES = (
            "nose", "l_eye", "r_eye", "l_ear", "r_ear",
            "l_shoulder", "r_shoulder", "l_elbow", "r_elbow",
        )
        SKELETON = [
            (6, 8), (8, 10), (5, 7), (7, 9)
        ]
        self.maxDrop = maxDrop

    @staticmethod
    def startVideoCapture():
        capture = VideoCapture(0)
        if not capture.isOpened():
            raise Exception("No Camera Found!")
        return capture

    @staticmethod
    def captureFrame(maxDrop):
        isSlouched = False
        expression = ""
        ultralyticsModel = YOLO("yolo11m-pose.pt")
        emotionalModel = HSEmotionRecognizer(model_name="enet_b0_8_best_afew")
        net = cv2.dnn.readNetFromCaffe("deploy.prototxt", "res10_300x300_ssd_iter_140000_fp16.caffemodel")
        BODY_NAMES = (
            "nose", "l_eye", "r_eye", "l_ear", "r_ear",
            "l_shoulder", "r_shoulder", "l_elbow", "r_elbow",
        )
        SKELETON = [
            (6, 8), (8, 10), (5, 7), (7, 9)
        ]
        frame = cv2.imread("happy.jpg")
        # Use model to get results and add those to a flattened keypoint 2d map
        results = ultralyticsModel.predict(frame, conf=0.25, verbose=False)
        keyPoints = results[0].keypoints.xy
        vis = frame.copy()

        # ------------------SLOUCH DETECTION-----------------
        singlePersonKeyPoints = results[0].keypoints.xy[0]
        Lshoulder, Rshoulder, Nose = singlePersonKeyPoints[5], singlePersonKeyPoints[6], singlePersonKeyPoints[0]
        midX = (Lshoulder + Rshoulder) / 2
        dropRatio = abs(Nose[1] - midX[1]) / np.linalg.norm(Lshoulder - Rshoulder)
        if (dropRatio < maxDrop):
            isSlouched = True
        else:
            isSlouched = False

        # ------------------FACIAL DETECTION -----------------
        # Make the frame for the face shape and make a blob for openCV
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300),
                                     (104, 117, 123), False, False)
        net.setInput(blob)
        detections = net.forward()

        # Detect the face with the given bounds
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
            # Evaulte data with the HSemotions model and output into variables
            label, scores = emotionalModel.predict_emotions(face[:, :, ::-1], logits=False)
            order = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']
            #conf_emotion = float(scores[order.index(label.lower())])
            expression = label
            break
        outputDict = {
            "isSlouched" : isSlouched,
            "expression" : expression
        }
        return json.dumps(outputDict)
        # ------------------SKELETON RENDERING -----------------
        # for person in results[0].keypoints.xy:
        #     for x, y in person:
        #         cv2.circle(vis, (int(x), int(y)), 4, (255, 0, 0), -1)
        # cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
        # cv2.putText(vis, f"{label}:{conf:.2f}", (x1, y2 + 25),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # draws frame
        # cv2.imshow("Keypoints", vis)
        # ------------------FRAME RENDERING-----------------

print(frameCapture.captureFrame(0.45))