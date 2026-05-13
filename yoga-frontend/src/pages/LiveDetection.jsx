import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { getPoseFeedback } from "../utils/poseFeedback"; 

function LiveDetection() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const detectingRef = useRef(false);

  const prevInputRef = useRef(null);
  const freezeCountRef = useRef(0);

  const smoothConfidenceRef = useRef(0);

  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [angles, setAngles] = useState({});
  const [detecting, setDetecting] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);

  const poseNames = [
    "Chair Pose",
    "Cobra Pose",
    "Dog Pose",
    "No Pose",
    "Shoulder Stand",
    "Triangle Pose",
    "Tree Pose",
    "Warrior Pose"
  ];

  const skeleton = [
    [11,13],[13,15],
    [12,14],[14,16],
    [11,12],
    [23,24],
    [11,23],[12,24],
    [23,25],[25,27],
    [24,26],[26,28]
  ];

  useEffect(() => {
    (async () => {
      await tf.ready();
      const m = await tf.loadLayersModel("/model/model.json");
      setModel(m);
      console.log("MODEL LOADED ✅");
    })();
  }, []);

  const calcAngle = (a,b,c)=>{
    if(!a||!b||!c) return 0;
    const ab=[a.x-b.x,a.y-b.y];
    const cb=[c.x-b.x,c.y-b.y];
    const dot=ab[0]*cb[0]+ab[1]*cb[1];
    const mag1=Math.hypot(...ab);
    const mag2=Math.hypot(...cb);
    if(mag1===0||mag2===0) return 0;
    return ((Math.acos(dot/(mag1*mag2))*180)/Math.PI).toFixed(1);
  };

  const isValidPose = (lm, index) => {

    const leftElbow = calcAngle(lm[11], lm[13], lm[15]);
    const rightElbow = calcAngle(lm[12], lm[14], lm[16]);
    const leftKnee = calcAngle(lm[23], lm[25], lm[27]);
    const rightKnee = calcAngle(lm[24], lm[26], lm[28]);

    if(index === 2){
      return (leftElbow > 150 && rightElbow > 150 && leftKnee > 150);
    }

    if(index === 6){
      return (leftKnee < 100 || rightKnee < 100);
    }

    if(index === 7){
      return (leftKnee < 120 || rightKnee < 120);
    }

    return true;
  };

  const drawSkeleton = (lm)=>{
    const canvas=canvasRef.current;
    const video=videoRef.current;
    if(!canvas||!video) return;

    const ctx=canvas.getContext("2d");

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#00FF88";
    ctx.lineWidth=3;

    skeleton.forEach(([a,b])=>{
      const p1=lm[a], p2=lm[b];
      if(!p1||!p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x*canvas.width,p1.y*canvas.height);
      ctx.lineTo(p2.x*canvas.width,p2.y*canvas.height);
      ctx.stroke();
    });

    lm.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x*canvas.width,p.y*canvas.height,5,0,2*Math.PI);
      ctx.fillStyle="lime";
      ctx.fill();
    });
  };

  useEffect(()=>{

    if(!model || cameraRef.current || !detecting) return;

    const pose=new Pose({
      locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
    });

    pose.setOptions({
      modelComplexity:1,
      smoothLandmarks:true
    });

    pose.onResults((res)=>{

      if(!res.poseLandmarks) return;

      const lm=res.poseLandmarks;
      drawSkeleton(lm);

      if(!detectingRef.current) return;

      const selected=[
        11,12,13,14,15,16,
        23,24,25,26,27,28,
        0,1,2,3,4
      ];

      const centerX = (lm[23].x + lm[24].x) / 2;
      const centerY = (lm[23].y + lm[24].y) / 2;

      const dx = lm[12].x - lm[11].x;
      const dy = lm[12].y - lm[11].y;

      const angle = Math.atan2(dy, dx);
      const scale = Math.hypot(dx, dy) || 1;

      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const input=[];

      selected.forEach(i=>{
        let x = lm[i].x - centerX;
        let y = lm[i].y - centerY;

        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;

        input.push(rx / scale);
        input.push(ry / scale);
      });

      let movement=0;

      if(prevInputRef.current){
        for(let i=0;i<input.length;i++){
          const diff = Math.abs(input[i] - prevInputRef.current[i]);
          if(diff > 0.02){
            movement += diff;
          }
        }
      }

      prevInputRef.current=input;

      const tensor=tf.tensor([input]);
      const preds=model.predict(tensor);
      const probs=tf.softmax(preds);
      const data=probs.dataSync();

      let max=Math.max(...data);
      const index=data.indexOf(max);

      if(movement > 0.15){
        max=Math.min(max + movement*1.2, 0.95);
      }

      if(movement < 0.08){
        freezeCountRef.current += 1;
      } else {
        freezeCountRef.current = 0;
      }

      if(freezeCountRef.current > 5){
        tf.dispose([tensor,preds,probs]);
        return;
      }

      let finalPrediction = "";
      let finalConfidence = max;

      if(max < 0.6 || !isValidPose(lm, index)){
        finalPrediction = "No Pose";
        finalConfidence = Math.min(max * 0.3, 0.3);
      } else {
        finalPrediction = poseNames[index];

        if(max > 0.8){
          finalConfidence = Math.min(1, max + 0.2);
        } else {
          finalConfidence = max;
        }
      }

      const smooth =
        smoothConfidenceRef.current * 0.9 + finalConfidence * 0.1;

      smoothConfidenceRef.current = smooth;

      setPrediction(finalPrediction);
      setConfidence((smooth*100).toFixed(1));

      const newAngles = {
        "Left Elbow": calcAngle(lm[11], lm[13], lm[15]),
        "Right Elbow": calcAngle(lm[12], lm[14], lm[16]),
        "Left Shoulder": calcAngle(lm[13], lm[11], lm[23]),
        "Right Shoulder": calcAngle(lm[14], lm[12], lm[24]),
        "Left Hip": calcAngle(lm[11], lm[23], lm[25]),
        "Right Hip": calcAngle(lm[12], lm[24], lm[26]),
        "Left Knee": calcAngle(lm[23], lm[25], lm[27]),
        "Right Knee": calcAngle(lm[24], lm[26], lm[28]),
      };

      setAngles(newAngles);

      tf.dispose([tensor,preds,probs]);
    });

    poseRef.current=pose;

    const camera=new Camera(videoRef.current,{
      onFrame: async ()=>{
        await pose.send({image:videoRef.current});
      },
      width:640,
      height:480
    });

    camera.start();
    cameraRef.current=camera;

  },[model, detecting]);

  useEffect(() => {
    if (!detecting && cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;

      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    }
  }, [detecting]);

  useEffect(() => {

    return () => {
      // cleanup when leaving page
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }

      console.log("Camera stopped ✅");
    };

  }, []);

  // ✅ NEW FEEDBACK LOGIC
  const feedbackList = getPoseFeedback(prediction, angles);
  const isPoseDetected = prediction && prediction !== "" && prediction !== "Waiting..." && prediction !== "No Pose";

  return (
    <div className="px-6 mx-auto pt-28 max-w-7xl">

      <h1 className="text-3xl font-bold text-center">
        Live pose Detection
      </h1>

      <div className="grid gap-10 mt-10 lg:grid-cols-2">

        <div className="p-6 bg-white shadow-lg rounded-xl">

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              className="w-full rounded-lg"
              style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
            />
          </div>

          <button
            onClick={() => {
              setDetecting(prev => {
                detectingRef.current = !prev;
                return !prev;
              });
            }}
            className={`w-full py-3 mt-4 text-white rounded-lg ${
              detecting ? "bg-red-500" : "bg-[#F47C3C]"
            }`}
          >
            {detecting ? "Stop Camera" : "Start Camera"}
          </button>

          <button
            onClick={() => setIsMirrored(prev => !prev)}
            className="w-full py-3 mt-4 text-white bg-[#F47C3C] rounded-lg"
          >
            {isMirrored ? "Mirror ON" : "Mirror OFF"}
          </button>

        </div>

        <div className="space-y-6">

          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="text-xl font-semibold">Detected Pose</h2>

            {!prediction ? (
              <p className="mt-2 text-gray-400">Waiting...</p>
            ) : (
              <div className="flex items-center gap-4 mt-3">
                <span className="px-4 py-1 text-white bg-[#F47C3C] rounded-full">
                  {prediction}
                </span>
                <span>{confidence}%</span>
              </div>
            )}

            <div className="w-full h-2 mt-3 bg-gray-200 rounded">
              <div className="h-2 bg-[#F47C3C] rounded" style={{ width: `${confidence}%` }} />
            </div>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="mb-3 text-xl font-semibold">Joint Angles</h2>

            {Object.entries(angles).map(([k,v])=>(
              <div key={k} className="flex justify-between py-1 border-b">
                <span>{k}</span>
                <span>{v}°</span>
              </div>
            ))}
          </div>

         <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="mb-3 text-xl font-semibold">Pose Feedback</h2>

          {feedbackList.length > 0 && isPoseDetected ? (

            <>
              {/* SUMMARY MESSAGE */}
              <div
                className={`p-3 mb-3 border-l-4 rounded ${
                  feedbackList.length > 3
                    ? "bg-red-50 border-red-400 text-red-600"
                    : "bg-yellow-50 border-yellow-400 text-yellow-600"
                }`}
              >
                {feedbackList.length > 3
                  ? "Major misalignment detected. Please correct your posture."
                  : "Minor adjustments needed to improve your posture."}
              </div>

              {/* DETAILED FEEDBACK */}
              {feedbackList.map((f, i) => (
                <div
                  key={i}
                  className="p-3 mb-2 border-l-4 border-orange-400 rounded bg-orange-50"
                >
                  {f.feedback}
                </div>
              ))}
            </>

          ) : isPoseDetected && confidence > 0.8 ? (

            <div className="p-3 text-green-600 border-l-4 border-green-400 rounded bg-green-50">
              Excellent posture. All joints aligned correctly.
            </div>

          ) : null}

         </div>

        </div>

      </div>

    </div>
  );
}

export default LiveDetection;