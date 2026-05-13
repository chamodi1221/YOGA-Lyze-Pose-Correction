import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { contactService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function Contact() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({ message: "" });
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [myMessages, setMyMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const loadMyMessages = async () => {
    try {
      setLoadingMessages(true);
      setErrorMessage("");

      const data = await contactService.getMyMessages();
      setMyMessages(data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to load your messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMyMessages();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      setErrorMessage("Please enter a message.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await contactService.createMessage(formData.message);

      setSuccessMessage("Your message has been sent successfully.");
      setFormData({ message: "" });

      await loadMyMessages();
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 mx-auto pt-28 pb-16 max-w-7xl">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-12 text-center"
      >
        

        <h1 className="text-4xl font-bold text-[#2E2E2E]">
          Contact Us
        </h1>

        <p className="max-w-2xl mx-auto mt-4 text-gray-600">
          Send your question to the admin team and view all replies from one place.
        </p>
      </motion.div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 text-green-700 border border-green-200 rounded-xl bg-green-50"
        >
          {successMessage}
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 text-red-700 border border-red-200 rounded-xl bg-red-50"
        >
          {errorMessage}
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-2xl font-bold text-[#2E2E2E]">
              Send a Message
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Signed in as{" "}
              <span className="font-semibold text-gray-700">
                {user?.username}
              </span>{" "}
              ({user?.email})
            </p>
          </div>

          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Your Message
              </label>

              <textarea
                rows="7"
                name="message"
                placeholder="Type your question or issue here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full p-4 mt-2 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#F47C3C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white font-semibold shadow-md hover:opacity-90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/60">
            <div>
              <h3 className="text-2xl font-bold text-[#2E2E2E]">
                Your Previous Messages
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View admin replies for your submitted messages.
              </p>
            </div>

            <div className="px-4 py-2 text-sm font-semibold text-[#F47C3C] bg-orange-100 rounded-full">
              {myMessages.length}
            </div>
          </div>

          <div className="p-6">
            {loadingMessages && (
              <p className="text-gray-600">Loading messages...</p>
            )}

            {!loadingMessages && myMessages.length === 0 && (
              <div className="p-6 text-center border border-dashed rounded-xl border-gray-200">
                <p className="font-semibold text-gray-700">
                  No messages yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your sent messages and admin replies will appear here.
                </p>
              </div>
            )}

            {!loadingMessages && myMessages.length > 0 && (
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                {myMessages.map((item) => {
                  const isReplied = item.status === "replied" || item.admin_reply;

                  return (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            isReplied
                              ? "text-green-700 bg-green-100"
                              : "text-yellow-700 bg-yellow-100"
                          }`}
                        >
                          {isReplied ? "Replied" : "Pending"}
                        </span>

                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1 text-sm font-semibold text-gray-700">
                          Your Message
                        </p>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {item.message}
                        </p>
                      </div>

                      {item.admin_reply ? (
                        <div className="p-4 mt-4 border rounded-xl bg-[#FFF7F1] border-[#FBD4BF]">
                          <p className="text-sm font-semibold text-[#E3642B]">
                            Admin Reply
                          </p>

                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                            {item.admin_reply}
                          </p>

                          {item.replied_at && (
                            <p className="mt-2 text-xs text-gray-500">
                              Replied at{" "}
                              {new Date(item.replied_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="p-3 mt-4 text-sm text-gray-500 border border-yellow-100 rounded-xl bg-yellow-50">
                          Waiting for admin reply.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;