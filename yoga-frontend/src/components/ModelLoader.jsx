import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";

export default function ModelLoader() {

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      const model = await tf.loadLayersModel("/model/model.json");
      console.log("Model loaded ✅", model);
    } catch (err) {
      console.error("Error loading model ❌", err);
    }
  };

  return null;
}