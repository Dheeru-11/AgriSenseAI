
import { useState } from "react";

export default function FertilizerAdvice() {
  const [crop, setCrop] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [result, setResult] = useState(null);

  function getAdvice() {
  if (
    !crop.trim() ||
    nitrogen === "" ||
    phosphorus === "" ||
    potassium === ""
  ) {
    alert("Please fill in all fields.");
    return;
  }

  const values = [nitrogen, phosphorus, potassium].map(Number);

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    alert("Please enter valid, non-negative nutrient values.");
    return;
  }

  setResult({
    crop: crop.trim(),
    message:
      "Your soil nutrient values have been recorded. To identify nutrient deficiencies and recommend a suitable fertilizer, we need the soil-test units and the laboratory's reference ranges.",
    tips: [
      "Compare nitrogen, phosphorus, and potassium results with your soil laboratory's recommended ranges.",
      "Use crop-specific fertilizer guidance from your local agricultural extension service.",
      "Avoid applying extra fertilizer based only on unverified nutrient numbers.",
      "Consider soil pH, crop growth stage, and previous fertilizer applications.",
    ],
  });
}

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-3 text-2xl font-bold text-green-400">
        🌾 Fertilizer Recommendation
      </h2>

      <p className="mb-5 text-slate-400">
        Enter your crop and soil nutrient values to receive
        fertilizer guidance.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Crop name (e.g. Rice)"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
        />

        <input
          type="number"
          placeholder="Nitrogen (N)"
          value={nitrogen}
          onChange={(e) => setNitrogen(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
        />

        <input
          type="number"
          placeholder="Phosphorus (P)"
          value={phosphorus}
          onChange={(e) => setPhosphorus(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
        />

        <input
          type="number"
          placeholder="Potassium (K)"
          value={potassium}
          onChange={(e) => setPotassium(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
        />
      </div>

      <button
  type="button"
  onClick={getAdvice}
        className="mt-5 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
      >
        Get Fertilizer Advice
      </button>
      {result && (
  <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
    <h3 className="mb-3 text-xl font-bold text-green-400">
      🌱 Fertilizer Guidance for {result.crop}
    </h3>

    <p className="mb-4 text-slate-300">{result.message}</p>

    <ul className="list-disc space-y-2 pl-5 text-slate-300">
      {result.tips.map((tip, index) => (
        <li key={index}>{tip}</li>
      ))}
    </ul>
  </div>
)}
    </div>
  );
}
