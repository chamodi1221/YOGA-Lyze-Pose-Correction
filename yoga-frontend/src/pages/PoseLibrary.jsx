import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const poses = [
  // 🟢 BEGINNER (3)
  {
    name: "Chair Pose",
    difficulty: "Beginner",
    images: [
      "/images/poses/chair/chair1.jpg",
      "/images/poses/chair/chair2.webp",
      "/images/poses/chair/chair3.avif"
    ],
    description: "Strengthens legs and improves balance.",
    steps: ["Stand straight","Bend knees","Raise arms"],
    benefits: ["Leg strength","Balance"],
    mistakes: ["Leaning forward"],
    warnings: ["Avoid knee pain"]
  },
  {
    name: "Cobra Pose",
    difficulty: "Beginner",
    images: [
      "/images/poses/cobra/cobra1.avif",
      "/images/poses/cobra/cobra2.avif",
      "/images/poses/cobra/cobra3.jpg"
    ],
    description: "Opens chest and strengthens spine.",
    steps: ["Lie down","Lift chest","Hold"],
    benefits: ["Spine strength","Flexibility"],
    mistakes: ["Overstretching"],
    warnings: ["Avoid back injury"]
  },
  {
    name: "Dog Pose",
    difficulty: "Beginner",
    images: [
      "/images/poses/dog/dog1.jpg",
      "/images/poses/dog/dog2.webp",
      "/images/poses/dog/dog3.avif"
    ],
    description: "Improves flexibility and stretches the body.",
    steps: ["Form V shape","Push hips up"],
    benefits: ["Flexibility","Circulation"],
    mistakes: ["Bent knees"],
    warnings: ["Avoid wrist pain"]
  },

  // 🟡 INTERMEDIATE (3)
  {
    name: "Warrior Pose",
    difficulty: "Intermediate",
    images: [
      "/images/poses/warrior/warrior1.webp",
      "/images/poses/warrior/warrior2.webp",
      "/images/poses/warrior/warrior3.jpeg"
    ],
    description: "Builds strength and stability.",
    steps: ["Step forward","Bend knee"],
    benefits: ["Strength","Stability"],
    mistakes: ["Knee forward"],
    warnings: ["Avoid knee strain"]
  },
  {
    name: "Triangle Pose",
    difficulty: "Intermediate",
    images: [
      "/images/poses/triangle pose/triangle1.jpg",
      "/images/poses/triangle pose/triangle2.webp",
      "/images/poses/triangle pose/triangle3.png"
    ],
    description: "Improves balance and flexibility.",
    steps: ["Stretch sideways","Touch foot"],
    benefits: ["Balance","Flexibility"],
    mistakes: ["Bending forward"],
    warnings: ["Avoid dizziness"]
  },
  {
    name: "Bridge Pose",
    difficulty: "Intermediate",
    images: [
      "/images/poses/bridge/bridge1.webp",
      "/images/poses/bridge/bridge2.webp",
      "/images/poses/bridge/bridge3.jpg"
    ],
    description: "Strengthens back and opens chest.",
    steps: ["Lie down","Lift hips","Hold"],
    benefits: ["Back strength","Flexibility"],
    mistakes: ["Overarching"],
    warnings: ["Avoid neck pressure"]
  },

  // 🔴 ADVANCED (3)
  {
    name: "Tree Pose",
    difficulty: "Advanced",
    images: [
      "/images/poses/tree/tree1.webp",
      "/images/poses/tree/tree2.webp",
      "/images/poses/tree/tree3.jpg"
    ],
    description: "Enhances balance and focus.",
    steps: ["Stand on one leg","Balance"],
    benefits: ["Focus","Balance"],
    mistakes: ["Losing posture"],
    warnings: ["Avoid slipping"]
  },
  {
    name: "Shoulder Stand",
    difficulty: "Advanced",
    images: [
      "/images/poses/shoulder/shoulder1.webp",
      "/images/poses/shoulder/shoulder2.webp",
      "/images/poses/shoulder/shoulder3.webp"
    ],
    description: "Improves circulation and core strength.",
    steps: ["Lift legs","Support back"],
    benefits: ["Circulation","Core"],
    mistakes: ["Neck pressure"],
    warnings: ["Avoid neck injury"]
  },
  {
    name: "Crow Pose",
    difficulty: "Advanced",
    images: [
      "/images/poses/crow/crow1.webp",
      "/images/poses/crow/crow2.webp",
      "/images/poses/crow/crow3.webp"
    ],
    description: "Builds arm strength and balance.",
    steps: ["Squat","Lean forward","Lift feet"],
    benefits: ["Arm strength","Balance"],
    mistakes: ["Falling forward"],
    warnings: ["Avoid wrist strain"]
  }
];

function PoseLibrary() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [selectedPose, setSelectedPose] = useState(null);
  const [visible, setVisible] = useState(6);
  const [imageIndex, setImageIndex] = useState({});

  const filtered = useMemo(() => {
    return poses.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (difficulty === "All" || p.difficulty === difficulty)
    );
  }, [search, difficulty]);

  const toggleFav = (name) => {
    setFavorites(prev =>
      prev.includes(name)
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  };

  const nextImage = (name, len) => {
    setImageIndex(prev => ({
      ...prev,
      [name]: ((prev[name] || 0) + 1) % len
    }));
  };

  const prevImage = (name, len) => {
    setImageIndex(prev => ({
      ...prev,
      [name]: ((prev[name] || 0) - 1 + len) % len
    }));
  };

  return (
    <div className="px-6 mx-auto pt-28 max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold text-center">
        Yoga Pose Library
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="px-4 py-2 border rounded-full"
        />

        <select
          onChange={(e)=>setDifficulty(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option>All</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, visible).map((pose,i)=>{
          const index = imageIndex[pose.name] || 0;

          return (
            <motion.div key={i} whileHover={{scale:1.05}}
              className="relative overflow-hidden bg-white shadow rounded-xl">

              <div className="relative">
                <img src={pose.images[index]} className="object-cover w-full h-48"/>

                <button onClick={()=>prevImage(pose.name, pose.images.length)}
                  className="absolute px-2 text-white rounded left-2 top-1/2 bg-black/50">
                  ◀️
                </button>

                <button onClick={()=>nextImage(pose.name, pose.images.length)}
                  className="absolute px-2 text-white rounded right-2 top-1/2 bg-black/50">
                  ▶️
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold">{pose.name}</h3>

                <span className="px-2 py-1 text-xs text-white bg-green-500 rounded">
                  {pose.difficulty}
                </span>

                <div className="flex justify-between mt-3">
                  <button onClick={()=>setSelectedPose(pose)}>View</button>

                  <button onClick={()=>toggleFav(pose.name)}>
                    {favorites.includes(pose.name) ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {visible < filtered.length && (
        <div className="flex justify-center mt-6">
          <button onClick={()=>setVisible(9)}
            className="px-4 py-2 text-white bg-[#F47C3C] rounded">
            Load More
          </button>
        </div>
      )}

      {selectedPose && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg">

            <h2 className="text-xl font-bold">{selectedPose.name}</h2>

            <h3 className="mt-3 font-semibold">Steps</h3>
            <ul>{selectedPose.steps.map((s,i)=><li key={i}>• {s}</li>)}</ul>

            <h3 className="mt-3 font-semibold">Benefits</h3>
            <ul>{selectedPose.benefits.map((b,i)=><li key={i}>• {b}</li>)}</ul>

            <h3 className="mt-3 font-semibold">Mistakes</h3>
            <ul>{selectedPose.mistakes.map((m,i)=><li key={i}>• {m}</li>)}</ul>

            <h3 className="mt-3 font-semibold">Warnings</h3>
            <ul>{selectedPose.warnings.map((w,i)=><li key={i}>• {w}</li>)}</ul>

            <button
              onClick={()=>setSelectedPose(null)}
              className="px-4 py-2 mt-4 text-white bg-red-500 rounded">
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default PoseLibrary;