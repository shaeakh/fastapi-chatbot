// app/page.tsx or pages/index.tsx (depending on your setup)
"use client";

import { motion } from "framer-motion";
import { Bot, SendHorizonal, User } from "lucide-react";
import { useState } from "react";
import { URLS } from "./utils/urls";
import { configDotenv } from "dotenv";

export default function Home() {
  configDotenv();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; role: string }[]>([]);

  const fetchChat = async (message: string) => {
    const userMessage = { text: message, role: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const res = await fetch(URLS.chat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userMessage),
    });

    const data = await res.json();
    if (data?.msg) {
      setMessages((prev) => [...prev, data.msg]);
    }
  };

  const handleSend = () => {
    console.log(process.env.BACKEND)
    if (input.trim() === "") return;
    fetchChat(input);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <div className="text-3xl font-bold text-center mb-4 text-indigo-600">Shaeakh's Bot 🤖</div>

        <div className="h-[60vh] overflow-y-auto space-y-4 scroll-smooth pr-2">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm p-3 rounded-xl shadow ${msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center border-t pt-4 gap-2">
          <input
            className="flex-1 p-3 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white p-3 rounded-full shadow-lg"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
