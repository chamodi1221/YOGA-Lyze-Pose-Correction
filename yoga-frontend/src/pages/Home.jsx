import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="pt-20">

      {/* HERO SECTION */}

      <section className="relative h-[70vh] flex items-center justify-center text-center">

        <img
          src="/images/home-img.webp"
          alt="AI yoga pose detection training"
          loading="lazy"
          className="absolute object-cover w-full h-full"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-3xl px-6 text-white">

          <Motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold"
          >
            AI Yoga Pose Correction
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg text-gray-200"
          >
            Improve your yoga practice with AI powered pose detection.
            Get real-time feedback and perfect your posture.
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Link
              to="/login"
              className="px-6 py-3 bg-[#F47C3C] text-white rounded-lg shadow-md hover:opacity-90"
            >
              Start Practice
            </Link>

            <Link
              to="/library"
              className="px-6 py-3 text-white border border-white rounded-lg hover:bg-white hover:text-black"
            >
              Explore Poses
            </Link>
          </Motion.div>

        </div>

      </section>



      {/* AI YOGA PRACTICE SECTION */}

      <section className="px-6 py-32 bg-white">

        <div className="grid items-center max-w-6xl gap-16 mx-auto md:grid-cols-2">

          {/* IMAGE SIDE */}

          <div className="relative">

            {/* MAIN IMAGE */}

            <Motion.img
              src="/images/big-img.webp"
              className="w-full shadow-xl rounded-2xl"
              initial={{ opacity:0, scale:0.95 }}
              whileInView={{ opacity:1, scale:1 }}
              transition={{ duration:0.6 }}
            />

            {/* OVERLAP IMAGE */}

            <Motion.img
              src="/images/overlap-img.webp"
              className="absolute w-64 border-4 border-white shadow-2xl -left-12 -bottom-12 rounded-xl"
              initial={{ opacity:0, x:-40 }}
              whileInView={{ opacity:1, x:0 }}
              transition={{ duration:0.6 }}
            />

          </div>


          {/* TEXT SIDE */}

          <Motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            transition={{ duration:0.6 }}
          >

            <h2 className="text-4xl font-bold text-gray-800">
              Perfect Your Yoga Practice
            </h2>

            <p className="mt-6 text-gray-600">
              Our AI powered yoga assistant analyzes your body posture and
              provides intelligent feedback to help you perform yoga poses
              correctly and safely.
            </p>

            <p className="mt-4 text-gray-600">
              Whether you are a beginner or experienced yogi, our system helps
              you improve flexibility, balance and posture through real-time
              pose detection.
            </p>

            <Link
              to="/library"
              className="inline-block px-6 py-3 mt-6 text-white bg-[#F47C3C] rounded-lg shadow-md hover:opacity-90"
            >
              Explore Yoga Poses
            </Link>

          </Motion.div>

        </div>

      </section>



      {/* HOW IT WORKS */}

      <section className="px-6 bg-gray-50 py-28">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl font-bold text-gray-800">
            How It Works
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-gray-600">
            Follow these simple steps to analyze and improve your yoga posture using AI.
          </p>

          <div className="grid gap-10 mt-16 md:grid-cols-3">

            <Motion.div whileHover={{ y: -8 }} className="p-8 bg-white border rounded-xl">

              <div className="text-3xl font-bold text-[#F47C3C]">01</div>

              <h3 className="mt-4 text-xl font-semibold">Choose Input Method</h3>

              <p className="mt-2 text-gray-600">
                Upload an image or use your camera to begin analyzing yoga poses.
              </p>

            </Motion.div>


            <Motion.div whileHover={{ y: -8 }} className="p-8 bg-white border rounded-xl">

              <div className="text-3xl font-bold text-[#F47C3C]">02</div>

              <h3 className="mt-4 text-xl font-semibold">AI Analysis</h3>

              <p className="mt-2 text-gray-600">
                Our AI analyzes your posture and body keypoints in real-time.
              </p>

            </Motion.div>


            <Motion.div whileHover={{ y: -8 }} className="p-8 bg-white border rounded-xl">

              <div className="text-3xl font-bold text-[#F47C3C]">03</div>

              <h3 className="mt-4 text-xl font-semibold">Get Feedback</h3>

              <p className="mt-2 text-gray-600">
                Receive suggestions to correct your posture and improve accuracy.
              </p>

            </Motion.div>

          </div>

        </div>

      </section>



      {/* FEATURES */}

      <section className="px-6 bg-white py-28">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl font-bold text-gray-800">
            Powerful Features
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-gray-600">
            Our AI system helps you improve yoga practice with intelligent analysis.
          </p>

          <div className="grid gap-10 mt-16 md:grid-cols-3">

            <Motion.div whileHover={{ scale: 1.05 }} className="p-8 shadow bg-gray-50 rounded-xl">

              <div className="text-[#F47C3C] text-4xl">📷</div>

              <h3 className="mt-4 text-xl font-semibold">
               Pose Detection
              </h3>

              <p className="mt-2 text-gray-600">
               Detect yoga poses instantly using your camera or uploaded images.
              </p>

            </Motion.div>


            <Motion.div whileHover={{ scale: 1.05 }} className="p-8 shadow bg-gray-50 rounded-xl">

              <div className="text-[#F47C3C] text-4xl">📊</div>

              <h3 className="mt-4 text-xl font-semibold">
                Pose Accuracy Analysis
              </h3>

              <p className="mt-2 text-gray-600">
                Analyze body joint angles to evaluate posture accuracy.
              </p>

            </Motion.div>


            <Motion.div whileHover={{ scale: 1.05 }} className="p-8 shadow bg-gray-50 rounded-xl">

              <div className="text-[#F47C3C] text-4xl">🤖</div>

              <h3 className="mt-4 text-xl font-semibold">
                Smart Feedback
              </h3>

              <p className="mt-2 text-gray-600">
                Get AI-powered suggestions to correct your yoga form.
              </p>

            </Motion.div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;