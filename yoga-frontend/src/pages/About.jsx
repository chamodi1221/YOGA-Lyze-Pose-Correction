/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";

function About() {

  const fadeUp = {
    hidden:{opacity:0,y:40},
    visible:{opacity:1,y:0,transition:{duration:0.6}}
  }

  return (

    <div className="pt-24">

      {/* HERO SECTION */}

      <div className="relative h-[420px]">

        <img
          src="/images/about-img.webp"
          alt="AI yoga pose correction practice"
          loading="lazy"
          className="object-cover w-full h-full"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-gradient-to-t from-black/70 to-black/30">

          <motion.h1
            initial={{opacity:0,y:20}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.6}}
            className="text-4xl font-bold md:text-5xl"
          >
            About YOGA Lyze
          </motion.h1>

          <p className="max-w-xl mt-4 text-lg text-gray-200">
            An AI powered yoga posture correction platform designed to help
            users practice yoga safely and improve body alignment.
          </p>

        </div>

      </div>


      <div className="px-6 mx-auto mt-20 max-w-7xl">


      {/* ABOUT PLATFORM */}

      <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{once:true}}
      className="mb-20 text-center"
      >

      <h2 className="mb-4 text-3xl font-semibold">
      About the Platform
      </h2>

      <p className="max-w-3xl mx-auto text-gray-600">
      YOGA Lyze is an intelligent yoga assistance platform that uses artificial
      intelligence to analyze yoga poses. The system observes body posture
      through a camera and compares it with correct yoga pose patterns. Based
      on this analysis, users receive feedback that helps them correct their
      posture and improve their practice.
      </p>

      </motion.section>


      {/* MISSION */}

      <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{once:true}}
      className="p-10 mb-20 text-center bg-orange-50 rounded-xl"
      >

      <h2 className="mb-4 text-3xl font-semibold">
      Our Mission
      </h2>

      <p className="max-w-3xl mx-auto text-gray-600">
      Our mission is to promote a healthier lifestyle by combining technology
      with yoga practice. By using artificial intelligence, the system helps
      users perform yoga poses safely while reducing the risk of injuries and
      improving posture.
      </p>

      </motion.section>


      {/* KEY FEATURES */}

      <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{once:true}}
      className="mb-20"
      >

      <h2 className="mb-10 text-3xl font-semibold text-center">
      Key Features
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

      <motion.div whileHover={{scale:1.05}} className="p-6 text-center bg-white shadow rounded-xl">
      Real-time yoga pose detection
      </motion.div>

      <motion.div whileHover={{scale:1.05}} className="p-6 text-center bg-white shadow rounded-xl">
      AI posture correction feedback
      </motion.div>

      <motion.div whileHover={{scale:1.05}} className="p-6 text-center bg-white shadow rounded-xl">
      Image based pose analysis
      </motion.div>

      <motion.div whileHover={{scale:1.05}} className="p-6 text-center bg-white shadow rounded-xl">
      Practice progress tracking
      </motion.div>

      </div>

      </motion.section>


      {/* BENEFITS */}

      <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{once:true}}
      className="mb-20"
      >

      <h2 className="mb-10 text-3xl font-semibold text-center">
      Benefits for Users
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

      <div className="p-6 text-center bg-white shadow rounded-xl">
      Beginner Friendly
      </div>

      <div className="p-6 text-center bg-white shadow rounded-xl">
      Reduce Injury Risk
      </div>

      <div className="p-6 text-center bg-white shadow rounded-xl">
      Improve Body Posture
      </div>

      </div>

      </motion.section>


      {/* CONTACT */}

      <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{once:true}}
      className="p-10 mb-20 text-center bg-gray-100 rounded-xl"
      >

      <h2 className="mb-4 text-3xl font-semibold">
      Contact & Support
      </h2>

      <p className="mb-6 text-gray-600">
      Need help or have questions about the platform? Our support team is ready
      to assist you.
      </p>

      <button className="px-6 py-3 text-white bg-[#F47C3C] rounded-lg hover:opacity-90">
      Contact Support
      </button>

      </motion.section>


      </div>

    </div>
  )

}

export default About;