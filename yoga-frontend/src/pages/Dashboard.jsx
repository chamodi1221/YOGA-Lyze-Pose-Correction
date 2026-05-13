import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {

  const { user } = useAuth();

  return (

    <div className="px-6 pb-16 mx-auto pt-28 max-w-7xl">

      {/* WELCOME SECTION */}
      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        className="mb-10"
      >

        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back👋
        </h1>

        <p className="mt-2 text-gray-500">
          Start improving your yoga posture with AI guidance.
        </p>

      </motion.div>


      {/* HERO QUICK ACTION SECTION */}
      <motion.div
        initial={{opacity:0}}
        animate={{opacity:1}}
        className="relative mb-12 overflow-hidden shadow-xl rounded-2xl"
      >

        {/* Background Image */}
        <img
          src="/images/dashboard-img.webp"
          alt="Yoga practice"
          className="object-cover w-full h-[360px]"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Quick Actions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">

          <Link to="/live">

            <motion.button
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
              className="w-[220px] py-3 text-white bg-[#F47C3C] rounded-lg shadow-lg font-medium"
            >
              Start Live Detection
            </motion.button>

          </Link>


          <Link to="/upload">

            <motion.button
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
              className="w-[220px] py-3 text-white bg-white/20 backdrop-blur-md rounded-lg border border-white font-medium"
            >
              Upload Image
            </motion.button>

          </Link>


          <Link to="/library">

            <motion.button
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
              className="w-[220px] py-3 text-white border border-white rounded-lg font-medium"
            >
              Pose Library
            </motion.button>

          </Link>

        </div>

      </motion.div>



      {/* AI SYSTEM STATUS */}
      <div className="mb-12">

        <h2 className="mb-5 text-xl font-semibold">
          AI System Status
        </h2>

        <div className="p-6 bg-white shadow-lg rounded-xl">

          <div className="flex items-center gap-3">

            <span className="w-3 h-3 bg-green-500 rounded-full"></span>

            <span className="text-gray-700">
              AI Pose Detection Server Running
            </span>

          </div>

        </div>

      </div>



      {/* AI DETECTION TIPS */}
      <div>

        <h2 className="mb-5 text-xl font-semibold">
          Detection Tips
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <motion.div
            whileHover={{y:-5}}
            className="p-6 bg-white shadow-lg rounded-xl"
          >

            <h3 className="font-semibold">
              Full Body Visible
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Ensure your entire body is visible in the camera frame.
            </p>

          </motion.div>


          <motion.div
            whileHover={{y:-5}}
            className="p-6 bg-white shadow-lg rounded-xl"
          >

            <h3 className="font-semibold">
              Good Lighting
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Practice in a well-lit environment for better detection accuracy.
            </p>

          </motion.div>


          <motion.div
            whileHover={{y:-5}}
            className="p-6 bg-white shadow-lg rounded-xl"
          >

            <h3 className="font-semibold">
              Stable Camera
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Keep your camera steady and maintain proper distance.
            </p>

          </motion.div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;