export const getPoseFeedback = (pose, angles) => {

  if (!pose || pose === "No Pose") return [];

  // 🔥 SAME as backend references (should match JSON)
  const reference = {
    "Chair Pose": {
      "Left Knee": 100,
      "Right Knee": 100
    },
    "Cobra Pose": {
      "Left Elbow": 170,
      "Right Elbow": 170,
      "Left Shoulder": 160,
      "Right Shoulder": 160
    },
    "Dog Pose": {
      "Left Elbow": 170,
      "Right Elbow": 170,
      "Left Knee": 170,
      "Right Knee": 170,
      "Left Hip": 120,
      "Right Hip": 120
    },
    "Triangle Pose": {
      "Left Hip": 120,
      "Right Hip": 120
    },
    "Tree Pose": {
      "Left Knee": 60,
      "Right Knee": 170
    },
    "Warrior Pose": {
      "Left Knee": 100,
      "Right Knee": 170
    },
    "Shoulder Stand": {
      "Left Hip": 170,
      "Right Hip": 170,
      "Left Knee": 170,
      "Right Knee": 170
    }
  };

  const ref = reference[pose];
  if (!ref) return [];

  const FEEDBACK_THRESHOLD = 10;

  let corrections = [];

  Object.keys(ref).forEach(joint => {

    const current = Number(angles[joint] || 0);
    const target = ref[joint];

    if (!current) return;

    const delta = target - current;

    if (Math.abs(delta) < FEEDBACK_THRESHOLD) return;

    const direction = delta > 0 ? "more" : "less";

    const jointLabel = joint.toLowerCase();

    corrections.push({
      joint,
      current_angle: current.toFixed(1),
      target_angle: target,
      delta: delta.toFixed(1),
      feedback: `Adjust your ${jointLabel} by ${Math.abs(delta).toFixed(0)}° ${direction}`
    });

  });

  // 🔥 SAME as backend sorting (biggest error first)
  corrections.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return corrections;
};