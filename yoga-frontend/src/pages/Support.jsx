import { useState } from "react";
import { motion } from "framer-motion";

function Support() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      q: "Why is my pose not detected?",
      a: "Ensure your full body is visible in the camera and lighting conditions are good."
    },
    {
      q: "Which yoga poses are supported?",
      a: "The system supports several common poses such as Tree Pose, Warrior Pose, Cobra Pose and Shoulder Stand."
    },
    {
      q: "Why are some joints highlighted in red?",
      a: "Red joints indicate posture corrections suggested by the AI system."
    },
    {
      q: "Why is image upload detection inaccurate?",
      a: "Ensure the uploaded image clearly shows the full body with minimal background obstruction."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="px-6 mx-auto pt-28 max-w-7xl">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-3xl font-bold">
          Support & Help Center
        </h1>

        <p className="mt-3 text-gray-500">
          Find guidance on using the AI yoga posture detection system and get help with common issues.
        </p>
      </motion.div>

      {/* HELP GUIDES */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-semibold">
          How To Use The System
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white shadow rounded-xl"
          >
            <h3 className="mb-2 font-semibold">
              Live Detection
            </h3>
            <p className="text-sm text-gray-600">
              Allow camera access and ensure your full body is visible in the frame.
              Hold the pose for accurate detection.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white shadow rounded-xl"
          >
            <h3 className="mb-2 font-semibold">
              Upload Image
            </h3>
            <p className="text-sm text-gray-600">
              Upload a clear full-body image with proper lighting to allow the AI
              system to analyze posture accurately.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white shadow rounded-xl"
          >
            <h3 className="mb-2 font-semibold">
              Improve Accuracy
            </h3>
            <p className="text-sm text-gray-600">
              Keep the camera stable, maintain proper distance and ensure
              minimal background distractions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI DETECTION TIPS */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-semibold">
          AI Detection Tips
        </h2>

        <div className="grid gap-6 text-center md:grid-cols-4">
          <div className="p-6 bg-white shadow rounded-xl">
            📷
            <p className="mt-2 text-sm">Keep camera stable</p>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            💡
            <p className="mt-2 text-sm">Use good lighting</p>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            📏
            <p className="mt-2 text-sm">Maintain proper distance</p>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            🧘
            <p className="mt-2 text-sm">Ensure full body is visible</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-semibold">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="p-5 bg-white shadow rounded-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between w-full font-medium text-left"
              >
                {faq.q}
                <span>{openFAQ === index ? "-" : "+"}</span>
              </button>

              {openFAQ === index && (
                <p className="mt-3 text-sm text-gray-600">
                  {faq.a}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Support;