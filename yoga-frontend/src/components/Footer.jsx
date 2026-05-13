import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="pb-8 text-gray-300 bg-gray-900 pt-14">

      {/*  change grid-cols-4 → grid-cols-3 */}
      <div className="grid gap-10 px-6 mx-auto max-w-7xl md:grid-cols-3">

        {/* LEFT */}
        <div>
          <h2 className="text-xl font-bold text-white">
            YOGA Lyze
          </h2>

          <p className="mt-3 text-sm text-gray-400">
            AI powered yoga pose detection platform helping you improve posture
            and practice yoga safely.
          </p>

          <div className="flex gap-4 mt-4 text-lg">
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">YouTube</a>
          </div>
        </div>

        {/* CENTER */}
        <div>
          <h3 className="mb-4 font-semibold text-white">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/library" className="hover:text-white">Pose Library</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* RIGHT */}
        <div>
          <h3 className="mb-4 font-semibold text-white">
            Yoga Classes
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Hatha Yoga</li>
            <li>Vinyasa Yoga</li>
            <li>Meditation</li>
          </ul>

          <div className="mt-6">
            <h3 className="mb-2 font-semibold text-white">
              Contact Info
            </h3>

            <p className="text-sm text-gray-400">
              Colombo, Sri Lanka
            </p>
            <p className="text-sm text-gray-400">
              +94 77 123 4567
            </p>
            <p className="text-sm text-gray-400">
              yogalyze@email.com
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="pt-6 mt-12 text-sm text-center text-gray-400 border-t border-gray-700">

        <div className="flex justify-center gap-6 mb-3">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms</a>
        </div>

        ©️ 2026 Yoga Lyze. All rights reserved.

      </div>

    </footer>
  );
}

export default Footer;