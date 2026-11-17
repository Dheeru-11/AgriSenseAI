
import { useState } from "react";

const farmingQuestions = [
  {
    keywords: ["water", "irrigation"],
    answer:
      "Water crops according to soil moisture, crop type, and weather. Avoid overwatering and check soil drainage.",
  },
  {
    keywords: ["fertilizer", "nutrient", "npk"],
    answer:
      "Use a soil test to identify nutrient needs. Choose fertilizer based on crop requirements and local agricultural guidance.",
  },
  {
    keywords: ["disease", "leaf", "spots"],
    answer:
      "Inspect leaves for unusual spots or discoloration. Improve airflow, avoid wetting leaves unnecessarily, and confirm the disease before applying treatments.",
  },
  {
    keywords: ["crop", "plant"],
    answer:
      "Crop selection depends on soil nutrients, pH, rainfall, temperature, and season. Try the Crop Recommendation feature in AgriSense AI.",
  },
  {
    keywords: ["weather", "rain", "temperature"],
    answer:
      "Check the Weather-Based Farming Advice section for local conditions. Adjust irrigation and field activities according to the forecast.",
  },
  {
    keywords: ["soil", "ph"],
    answer:
      "Healthy soil needs good structure, drainage, and balanced nutrients. A soil test can help identify pH and nutrient issues.",
  },
];

function getBotReply(question) {
  const text = question.toLowerCase();

  const match = farmingQuestions.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword))
  );

  return match
    ? match.answer
    : "I can help with crops, irrigation, fertilizer, plant diseases, weather, and soil. Please ask a question about one of these topics.";
}

export default function FarmingChatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 🌱 I'm your AgriSense Farming Assistant. Ask me a farming question!",
    },
  ]);

  function sendMessage() {
    const question = message.trim();
    if (!question) return;

    const reply = getBotReply(question);

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: question },
      { sender: "bot", text: reply },
    ]);

    setMessage("");
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-3 text-2xl font-bold text-green-400">
        🤖 AgriSense Farming Chatbot
      </h2>

      <p className="mb-4 text-sm text-slate-400">
        Ask common farming questions about crops, soil, irrigation,
        fertilizer, weather, and plant diseases.
      </p>

      <div className="mb-4 h-72 space-y-3 overflow-y-auto rounded-xl bg-slate-950 p-4">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`flex ${
              item.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                item.sender === "user"
                  ? "bg-green-600 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask a farming question..."
          className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
        />

        <button
          type="button"
          onClick={sendMessage}
          className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          Send
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        This chatbot provides general farming information, not a
        confirmed diagnosis or crop-specific treatment plan.
      </p>
    </div>
  );
}
