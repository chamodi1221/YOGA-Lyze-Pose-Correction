import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, CheckCircle, Send, Trash2 } from "lucide-react";
import { adminService } from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await adminService.getAllContactMessages();
      setMessages(data);

      setReplyDrafts((previous) => {
        const next = { ...previous };
        data.forEach((item) => {
          if (next[item.id] === undefined) {
            next[item.id] = item.admin_reply || "";
          }
        });
        return next;
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const totalMessages = messages.length;

  const messageCountLabel = useMemo(() => {
    if (loading) return "Loading...";
    return `${totalMessages} messages`;
  }, [loading, totalMessages]);

  const handleDraftChange = (messageId, value) => {
    setReplyDrafts((previous) => ({
      ...previous,
      [messageId]: value,
    }));
  };

  const handleSendReply = async (messageId) => {
    const replyText = (replyDrafts[messageId] || "").trim();

    if (!replyText) {
      setErrorMessage("Reply cannot be empty.");
      setSuccessMessage("");
      return;
    }

    try {
      setSavingId(messageId);
      setErrorMessage("");
      setSuccessMessage("");

      await adminService.replyToContactMessage(messageId, replyText);

      setSuccessMessage("Reply sent successfully.");
      await loadMessages();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to send admin reply."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(messageId);
      setErrorMessage("");
      setSuccessMessage("");

      await adminService.deleteContactMessage(messageId);

      setSuccessMessage("Message deleted successfully.");
      await loadMessages();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to delete message."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#F47C3C]">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-[#2E2E2E]">
              Contact Messages
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Manage user inquiries and send replies from one clean workspace.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Messages</p>
            <p className="mt-1 text-3xl font-extrabold text-[#F47C3C]">
              {messageCountLabel}
            </p>
          </div>
        </motion.div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {errorMessage}
          </motion.div>
        )}

        {loading && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-gray-600">Loading messages...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800">
              No messages found
            </h3>
            <p className="mt-2 text-gray-500">
              User contact messages will appear here.
            </p>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="space-y-6">
            {messages.map((item) => {
              const isReplied = item.status === "replied" || item.admin_reply;

              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 border-b border-gray-100 bg-gradient-to-r from-white to-[#FFF7F1] p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E7] text-lg font-extrabold text-[#F47C3C]">
                        {item.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <p className="text-lg font-bold text-[#2E2E2E]">
                          {item.name}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} />
                          {item.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-3 lg:justify-end">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                            isReplied
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {isReplied ? (
                            <CheckCircle size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                          {isReplied ? "Replied" : "Pending"}
                        </span>

                        <button
                          onClick={() => handleDeleteMessage(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={13} />
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      <p className="mt-3 text-xs text-gray-500">
                        Sent: {new Date(item.created_at).toLocaleString()}
                      </p>

                      {item.replied_at && (
                        <p className="mt-1 text-xs text-gray-500">
                          Replied: {new Date(item.replied_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5">
                      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                        User Message
                      </p>
                      <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-[#FFF8F3] p-5">
                      <label className="text-sm font-bold uppercase tracking-wide text-[#F47C3C]">
                        Admin Reply
                      </label>

                      <textarea
                        rows="6"
                        value={replyDrafts[item.id] || ""}
                        onChange={(e) =>
                          handleDraftChange(item.id, e.target.value)
                        }
                        className="mt-3 w-full resize-none rounded-2xl border border-orange-100 bg-white p-4 text-gray-800 shadow-sm focus:border-[#F47C3C] focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="Type your reply to the user..."
                      />

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleSendReply(item.id)}
                          disabled={savingId === item.id}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F47C3C] to-[#E3642B] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Send size={16} />
                          {savingId === item.id ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminMessages;