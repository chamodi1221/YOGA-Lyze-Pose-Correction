import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function UploadImage() {

  const [image,setImage] = useState(null);
  const [preview,setPreview] = useState(null);
  const [pose,setPose] = useState("");
  const [confidence,setConfidence] = useState(0);
  const [angles,setAngles] = useState({});
  const [feedback,setFeedback] = useState([]);
  const [loading,setLoading] = useState(false);
  const [connected,setConnected] = useState(false);

  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const skeleton = [
    ["LEFT_SHOULDER","LEFT_ELBOW"],
    ["LEFT_ELBOW","LEFT_WRIST"],
    ["RIGHT_SHOULDER","RIGHT_ELBOW"],
    ["RIGHT_ELBOW","RIGHT_WRIST"],
    ["LEFT_SHOULDER","RIGHT_SHOULDER"],
    ["LEFT_HIP","RIGHT_HIP"],
    ["LEFT_SHOULDER","LEFT_HIP"],
    ["RIGHT_SHOULDER","RIGHT_HIP"],
    ["LEFT_HIP","LEFT_KNEE"],
    ["LEFT_KNEE","LEFT_ANKLE"],
    ["RIGHT_HIP","RIGHT_KNEE"],
    ["RIGHT_KNEE","RIGHT_ANKLE"]
  ];

  useEffect(() => {

    wsRef.current = new WebSocket("ws://localhost:8000/pose/stream");

    wsRef.current.onopen = () => {
      console.log("Connected to AI server");
      setConnected(true);
    };

    wsRef.current.onmessage = (event) => {

      const data = JSON.parse(event.data);
      console.log("DATA FROM BACKEND:", data);

      const formattedPose =
        data.pose_class === "tree" ? "Tree Pose" :
        data.pose_class === "warrior" ? "Warrior Pose" :
        data.pose_class === "chair" ? "Chair Pose" :
        data.pose_class === "dog" ? "Dog Pose" :
        data.pose_class === "cobra" ? "Cobra Pose" :
        data.pose_class === "triangle" ? "Triangle Pose" :
        data.pose_class === "shoulder_stand" ? "Shoulder Stand" :
        data.pose_class;

      setPose(formattedPose);

      setConfidence(data.confidence);
      setAngles(data.angles || {});
      setFeedback(data.feedback || []);
      setLoading(false);

      if(data.keypoints){
        drawSkeleton(data.keypoints);
      }

    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    return () => wsRef.current.close();

  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const analyzePose = () => {

    if(!image) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = () => {

      console.log("SENDING IMAGE TO BACKEND...");

      const blob = new Blob([reader.result], { type: image.type || "image/jpeg" });

      if(wsRef.current.readyState === 1){
        wsRef.current.send(blob);
      } else {
        console.log("WebSocket not ready");
      }

    };

    reader.readAsArrayBuffer(image);

  };

  const drawSkeleton = (keypoints) => {

    const canvas = canvasRef.current;
    const img = imgRef.current;

    if(!canvas || !img) return;

    const ctx = canvas.getContext("2d");

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const scaleX = displayWidth / imgWidth;
    const scaleY = displayHeight / imgHeight;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const map = {};
    keypoints.forEach(k => map[k.body_part] = k);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00FF88";

    skeleton.forEach(([a,b]) => {

      if(map[a] && map[b]){

        const x1 = map[a].x * scaleX;
        const y1 = map[a].y * scaleY;

        const x2 = map[b].x * scaleX;
        const y2 = map[b].y * scaleY;

        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();

      }

    });

    keypoints.forEach(p => {

      const x = p.x * scaleX;
      const y = p.y * scaleY;

      ctx.beginPath();
      ctx.arc(x,y,6,0,2*Math.PI);
      ctx.fillStyle = "lime";
      ctx.fill();

    });

  };

  const generateFrontendFeedback = (pose, angles) => {

    const reference = {
      "Chair Pose": { "Left Knee": 100, "Right Knee": 100 },
      "Cobra Pose": {
        "Left Elbow": 170, "Right Elbow": 170,
        "Left Shoulder": 160, "Right Shoulder": 160
      },
      "Dog Pose": {
        "Left Elbow": 170, "Right Elbow": 170,
        "Left Knee": 170, "Right Knee": 170,
        "Left Hip": 120, "Right Hip": 120
      },
      "Triangle Pose": { "Left Hip": 120, "Right Hip": 120 },
      "Tree Pose": { "Left Knee": 60, "Right Knee": 170 },
      "Warrior Pose": { "Left Knee": 100, "Right Knee": 170 },
      "Shoulder Stand": {
        "Left Hip": 170, "Right Hip": 170,
        "Left Knee": 170, "Right Knee": 170
      }
    };

    const FEEDBACK_THRESHOLD = 10;
    let corrections = [];

    const normalizedAngles = {};
    Object.entries(angles || {}).forEach(([k, v]) => {
      const key = k.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
      normalizedAngles[key] = v;
    });

    const ref = reference[pose];

    if (ref) {

      Object.keys(ref).forEach(joint => {

        const current = Number(normalizedAngles[joint] || 0);
        const target = ref[joint];

        if (!current) return;

        const delta = target - current;

        if (Math.abs(delta) < FEEDBACK_THRESHOLD) return;

        const direction = delta > 0 ? "more" : "less";

        corrections.push({
          delta: Math.abs(delta),
          feedback: `Adjust your ${joint.toLowerCase()} by ${Math.abs(delta).toFixed(0)} deg ${direction}`
        });

      });

    } else {

      Object.entries(normalizedAngles).forEach(([joint, value]) => {

        const angle = Number(value);

        if (!angle) return;

        if (joint.includes("Knee")) {

          if (angle < 70) {
            corrections.push({
              delta: 1,
              feedback: `Your ${joint.toLowerCase()} is too bent. Try extending it slightly`
            });
          }

          if (angle > 170) {
            corrections.push({
              delta: 1,
              feedback: `Your ${joint.toLowerCase()} is overextended. Slightly bend it`
            });
          }

        }

        if (joint.includes("Elbow")) {

          if (angle < 60) {
            corrections.push({
              delta: 1,
              feedback: `Your ${joint.toLowerCase()} is too tight. Relax it slightly`
            });
          }

        }

        if (joint.includes("Hip")) {

          if (angle < 90) {
            corrections.push({
              delta: 1,
              feedback: `Your ${joint.toLowerCase()} alignment can be improved`
            });
          }

        }

      });

    }

    corrections.sort((a, b) => b.delta - a.delta);

    return corrections;
  };

  const frontendFeedback = generateFrontendFeedback(pose, angles);
  const hasSeriousIssue = Array.isArray(feedback) && feedback.some(f => {
    const text = (typeof f === "string" ? f : f?.feedback)?.toLowerCase?.() || "";
    return text.includes("overextended") || text.includes("too bent");
  });
  const prediction = pose;
  const isPoseDetected = prediction && prediction !== "" && confidence > 0;

  return (
    <motion.div
      initial={{opacity:0,y:30}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.5}}
      className="px-6 mx-auto pt-28 max-w-7xl"
    >

      <h1 className="text-3xl font-bold text-center">
        Upload Image Pose Detection
      </h1>

      <p className="mt-2 text-sm text-center text-gray-500">
        {connected ? "AI Server Connected" : "Connecting to AI Server..."}
      </p>

      <div className="grid gap-10 mt-10 lg:grid-cols-2">

        <motion.div whileHover={{scale:1.01}} className="p-6 bg-white shadow-lg rounded-xl">

          <div className="p-10 text-center border-2 border-gray-300 border-dashed rounded-lg">
            <p className="text-gray-500">
              Drag & Drop image or click to upload
            </p>

            <input type="file" onChange={handleUpload} className="mt-4" />
          </div>

          {preview && (
            <div className="relative mt-6">
              <motion.img
                ref={imgRef}
                initial={{opacity:0,scale:0.95}}
                animate={{opacity:1,scale:1}}
                transition={{duration:0.3}}
                src={preview}
                className="w-full rounded-lg shadow"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          )}

          <motion.button
            whileHover={{scale:1.03}}
            whileTap={{scale:0.95}}
            onClick={analyzePose}
            className="w-full py-3 mt-6 text-white bg-[#F47C3C] rounded-lg"
          >
            {loading ? "Analyzing..." : "Analyze Pose"}
          </motion.button>

        </motion.div>

        <div className="space-y-6">

          <motion.div className="p-6 bg-white shadow rounded-xl">
            <h2 className="text-xl font-semibold">Detected Pose</h2>

            {pose === "" ? (
              <p className="mt-2 text-gray-400">Upload image to detect pose</p>
            ) : (
              <div className="flex items-center gap-4 mt-3">
                <span className="px-4 py-1 text-white bg-[#F47C3C] rounded-full">
                  {pose}
                </span>
                <span className="text-gray-600">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <div className="w-full h-2 mt-3 bg-gray-200 rounded">
              <motion.div
                initial={{width:0}}
                animate={{width:`${confidence*100}%`}}
                className="h-2 bg-[#F47C3C] rounded"
              />
            </div>
          </motion.div>

          <motion.div className="p-6 bg-white shadow rounded-xl">
            <h2 className="mb-3 text-xl font-semibold">Joint Angles</h2>

            {Object.keys(angles).length === 0 && (
              <p className="text-sm text-gray-400">No angle data yet</p>
            )}

            {Object.entries(angles).map(([joint,angle]) => (
              <div key={joint} className="flex justify-between py-1 border-b">
                <span className="text-gray-600 capitalize">
                  {joint.replace("_"," ")}
                </span>
                <span className="font-medium">{angle}°</span>
              </div>
            ))}
          </motion.div>

          <motion.div className="p-6 bg-white shadow rounded-xl">
            <h2 className="mb-3 text-xl font-semibold">Pose Feedback</h2>

            {!isPoseDetected ? (
              <p className="text-gray-400">No feedback yet</p>
            ) : Array.isArray(feedback) && feedback.length > 0 ? (
              <>
                <div className={`p-3 mb-3 border-l-4 rounded ${
                  hasSeriousIssue || feedback.length > 3
                    ? "bg-red-50 border-red-400 text-red-600"
                    : "bg-yellow-50 border-yellow-400 text-yellow-600"
                }`}>
                  {hasSeriousIssue || feedback.length > 3
                    ? "Major misalignment detected. Please correct your posture."
                    : "Minor adjustments needed to improve your posture."}
                </div>

                {feedback.map((f, i) => {
                  const text = typeof f === "string" ? f : f?.feedback;
                  if (!text) return null;

                  return (
                    <motion.div
                      key={i}
                      className="p-3 mb-2 border-l-4 border-orange-400 rounded bg-orange-50"
                    >
                      {text}
                    </motion.div>
                  );
                })}
              </>
            ) : frontendFeedback.length > 0 ? (
              <>
                <div className={`p-3 mb-3 border-l-4 rounded ${
                  frontendFeedback.length > 3
                    ? "bg-red-50 border-red-400 text-red-600"
                    : "bg-yellow-50 border-yellow-400 text-yellow-600"
                }`}>
                  {frontendFeedback.length > 3
                    ? "Major misalignment detected. Please correct your posture."
                    : "Minor adjustments needed to improve your posture."}
                </div>

                {frontendFeedback.map((f, i) => (
                  <motion.div
                    key={i}
                    className="p-3 mb-2 border-l-4 border-orange-400 rounded bg-orange-50"
                  >
                    {f.feedback}
                  </motion.div>
                ))}
              </>
            ) : null}

          </motion.div>

        </div>

      </div>

    </motion.div>
  );
}

export default UploadImage;