import FarmingChatbot from "./FarmingChatbot";
import FertilizerAdvice from "./FertilizerAdvice";
import WeatherAdvice from "./WeatherAdvice";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const initialFormData = {
  N: 90,
  P: 42,
  K: 43,
  temperature: 25,
  humidity: 80,
  ph: 6.5,
  rainfall: 200,
};

const fields = [
  { name: "N", label: "Nitrogen (N)", unit: "mg/kg" },
  { name: "P", label: "Phosphorus (P)", unit: "mg/kg" },
  { name: "K", label: "Potassium (K)", unit: "mg/kg" },
  { name: "temperature", label: "Temperature", unit: "°C" },
  { name: "humidity", label: "Humidity", unit: "%" },
  { name: "ph", label: "Soil pH", unit: "pH" },
  { name: "rainfall", label: "Rainfall", unit: "mm" },
];

function getDiseaseAdvice(className) {
  const disease = className.toLowerCase().replaceAll("_", " ");

  if (disease.includes("healthy")) {
    return {
      title: "Keep your plant healthy",
      actions: [
        "Continue regular monitoring for spots, discoloration, and pests.",
        "Maintain suitable watering, drainage, and plant nutrition.",
        "Clean gardening tools and inspect nearby plants regularly.",
      ],
    };
  }

  if (
    disease.includes("late blight") ||
    disease.includes("phytophthora")
  ) {
    return {
      title: "Possible late blight",
      actions: [
        "Inspect the plant and nearby plants for rapidly spreading lesions.",
        "Avoid overhead watering and prolonged leaf wetness.",
        "Remove severely affected plant material where appropriate.",
        "Seek local agricultural advice promptly if the disease is spreading.",
      ],
    };
  }

  if (
    disease.includes("early blight") ||
    disease.includes("alternaria")
  ) {
    return {
      title: "Possible early blight",
      actions: [
        "Remove heavily affected leaves when appropriate.",
        "Water near the soil rather than wetting the foliage.",
        "Keep plants spaced to improve airflow and reduce leaf wetness.",
        "Confirm the disease before selecting a treatment.",
      ],
    };
  }

  if (
    disease.includes("bacterial spot") ||
    disease.includes("bacterial blight")
  ) {
    return {
      title: "Possible bacterial disease",
      actions: [
        "Avoid handling plants while foliage is wet.",
        "Clean tools between plants and remove affected debris.",
        "Avoid overhead irrigation and use clean planting material.",
        "Ask a local agricultural expert to confirm the cause before treatment.",
      ],
    };
  }

  if (
    disease.includes("mosaic virus") ||
    disease.includes("yellow leaf curl") ||
    disease.includes("leaf curl virus")
  ) {
    return {
      title: "Possible viral disease",
      actions: [
        "Inspect nearby plants for similar symptoms.",
        "Check for insect vectors such as whiteflies or aphids.",
        "Remove severely affected plants only after confirming the diagnosis and local recommendations.",
        "Use clean planting material and manage insect vectors appropriately.",
      ],
    };
  }

  if (
    disease.includes("powdery mildew") ||
    disease.includes("leaf mold") ||
    disease.includes("rust") ||
    disease.includes("scab") ||
    disease.includes("septoria") ||
    disease.includes("black rot") ||
    disease.includes("target spot")
  ) {
    return {
      title: "Possible fungal disease",
      actions: [
        "Inspect both sides of the leaves for characteristic symptoms.",
        "Remove affected fallen leaves where appropriate.",
        "Improve airflow and avoid keeping foliage wet for long periods.",
        "Confirm the disease before choosing a crop-specific fungicide.",
      ],
    };
  }

  if (
    disease.includes("spider mite") ||
    disease.includes("mite")
  ) {
    return {
      title: "Possible mite damage",
      actions: [
        "Inspect the underside of leaves for mites, eggs, or fine webbing.",
        "Check nearby plants for similar damage.",
        "Use an appropriate integrated pest-management method after confirming the pest.",
        "Follow local agricultural guidance before applying any pesticide.",
      ],
    };
  }

  return {
    title: "Inspect and confirm the result",
    actions: [
      "Check the leaf for spots, yellowing, discoloration, or pest damage.",
      "Compare symptoms across several leaves and nearby plants.",
      "Remove fallen plant debris and keep tools clean.",
      "Consult a local agricultural expert before applying treatment.",
    ],
  };
}

function App() {
  // Crop recommendation state
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Plant disease detection state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseError, setDiseaseError] = useState("");

  // Release the previous image preview when it changes.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const predictCrop = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Crop prediction failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to AgriSense AI. Check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setDiseaseResult(null);
    setDiseaseError("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setSelectedImage(null);
      setDiseaseError("Please select a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedImage(null);
      setDiseaseError("The image must be smaller than 10 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const predictDisease = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      setDiseaseError("Please upload a leaf image first.");
      return;
    }

    setDiseaseLoading(true);
    setDiseaseError("");
    setDiseaseResult(null);

    try {
      const body = new FormData();
      body.append("file", selectedImage);

      const response = await fetch(`${import.meta.env.VITE_DISEASE_API_URL}/predict-disease`, {
  method: "POST",
  body,
});

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail || "Plant disease prediction failed."
        );
      }

      const data = await response.json();
      setDiseaseResult(data);
    } catch (err) {
      setDiseaseError(
        err.message ||
          "Unable to connect to the disease detection API. Check the backend."
      );
    } finally {
      setDiseaseLoading(false);
    }
  };

  const clearDiseaseImage = () => {
    setSelectedImage(null);
    setDiseaseResult(null);
    setDiseaseError("");

    const input = document.getElementById("leaf-image");
    if (input) input.value = "";
  };

  const advice = diseaseResult
    ? getDiseaseAdvice(diseaseResult.predicted_class || "")
    : null;

  const readableDisease = diseaseResult
    ? (diseaseResult.predicted_class || "Unknown")
        .replaceAll("___", " — ")
        .replaceAll("_", " ")
    : "";

  return (
    <div className="min-h-screen scroll-smooth bg-slate-950 text-white">
      
{/* Header */}
<header className="sticky top-0 z-50 border-b border-green-500/20 bg-slate-950/95 backdrop-blur-md">
  <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 md:grid-cols-[1fr_auto_auto] md:px-6">

    {/* Logo and project name */}
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 text-3xl">
        🌱
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-green-400">
          AgriSense AI
        </h1>
        <p className="text-xs text-slate-400">
          Intelligent Agriculture Advisor
        </p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="col-span-2 row-start-2 flex items-center justify-start gap-4 overflow-x-auto whitespace-nowrap pb-2 text-xs font-medium text-slate-300 md:col-span-1 md:row-start-1 md:justify-center md:overflow-visible md:pb-0 md:text-sm">
      <a href="#crop" className="transition hover:text-green-400">
        🌾 Crops
      </a>
      <a href="#disease" className="transition hover:text-green-400">
        🍃 Diseases
      </a>
      <a href="#weather" className="transition hover:text-green-400">
        ☀️ Weather
      </a>
      <a href="#fertilizer" className="transition hover:text-green-400">
        🧪 Fertilizer
      </a>
      <a href="#chatbot" className="transition hover:text-green-400">
        🤖 Chatbot
      </a>
    </nav>

    {/* Status */}
    <div className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">
      ● AI Powered
    </div>

  </div>
</header>

{/* Welcome Section */}
<section className="border-b border-slate-800 bg-gradient-to-br from-green-950/40 via-slate-950 to-slate-950">
  <div className="mx-auto max-w-6xl px-6 py-14 text-center">
    <div className="mb-5 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
      🌱 Smart Farming Starts Here
    </div>

    <h2 className="mb-5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl">
      Grow Smarter with{" "}
      <span className="text-green-400">AgriSense AI</span>
    </h2>

    <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
      Your intelligent agriculture assistant for crop recommendations,
      plant disease detection, weather insights, fertilizer guidance,
      and farming support.
    </p>

    <a
      href="#crop"
      className="mt-8 inline-block rounded-xl bg-green-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-green-400"
    >
      🌾 Get Started
    </a>
  </div>
</section>


      <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        {/* Intro */}
        <div className="text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-400">
            Smart Farming
          </p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Your Intelligent Farming Assistant
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Get crop recommendations from soil conditions and inspect
            plant leaves with our experimental AI disease prediction model.
          </p>
        </div>

        {/* Crop Recommendation */}
        <section
  id="crop"
  className="scroll-mt-28 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/10"
>
          <div className="mb-6">
            <h3 className="text-2xl font-bold">🌾 Crop Recommendation</h3>
            <p className="mt-2 text-slate-400">
              Enter your soil and environmental conditions to find a
              potentially suitable crop.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl lg:col-span-2">
              <h4 className="text-xl font-semibold">Farm Conditions</h4>
              <p className="mt-1 text-sm text-slate-400">
                Enter the available measurements from your farm.
              </p>

              <form onSubmit={predictCrop}>
                <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={`crop-${field.name}`}
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        {field.label}
                      </label>

                      <div className="relative">
                        <input
                          id={`crop-${field.name}`}
                          type="number"
                          step="any"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-16 text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Analyzing Farm Conditions..."
                    : "🌾 Predict Best Crop"}
                </button>
              </form>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </div>
              )}
            </section>

            {/* Crop Result */}
            <section
              aria-live="polite"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <h4 className="text-xl font-semibold">AI Recommendation</h4>

              {!result && !loading && (
                <div className="mt-8 flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="text-6xl">🌱</div>
                  <p className="mt-5 text-slate-400">
                    Your crop recommendation will appear here.
                  </p>
                </div>
              )}

              {loading && (
                <div className="mt-8 flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-green-500" />
                  <p className="text-slate-300">
                    Analyzing your farm conditions...
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="mt-8">
                  <div className="rounded-2xl bg-green-500/10 p-6 text-center">
                    <div className="text-5xl">🌾</div>
                    <p className="mt-4 text-sm uppercase tracking-wider text-slate-400">
                      Recommended Crop
                    </p>
                    <h5 className="mt-2 break-words text-4xl font-bold capitalize text-green-400">
                      {result.recommended_crop}
                    </h5>
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-950 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">
                        Model Confidence
                      </span>
                      <span className="font-bold text-white">
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Number(result.confidence) || 0)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-slate-400">
                    🤖 Prediction from the AgriSense AI crop model.
                    Confirm suitability using local agricultural guidance.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Plant Disease Detection */}
        <section
  id="disease"
  className="scroll-mt-28 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/10"
>
          <div className="mb-6">
            <h3 className="text-2xl font-bold">
              🍃 Plant Disease Detection
            </h3>
            <p className="mt-2 text-slate-400">
              Upload a leaf photo to get an experimental disease
              prediction and general care suggestions.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upload */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h4 className="text-xl font-semibold">Upload a Leaf Image</h4>
              <p className="mt-2 text-sm text-slate-400">
                Use a clear, well-lit photo showing the leaf.
                JPG, PNG, or WebP; maximum 10 MB.
              </p>

              <form onSubmit={predictDisease}>
                <label
                  htmlFor="leaf-image"
                  className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-6 text-center transition hover:border-green-500"
                >
                  <span className="text-5xl">📷</span>
                  <span className="mt-3 font-semibold text-green-400">
                    Choose a leaf photo
                  </span>
                  <span className="mt-1 break-all text-sm text-slate-400">
                    {selectedImage
                      ? selectedImage.name
                      : "Click here to browse files"}
                  </span>
                  <input
                    id="leaf-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>

                {imagePreview && (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-slate-300">
                      Image preview
                    </p>
                    <img
                      src={imagePreview}
                      alt="Selected plant leaf preview"
                      className="mx-auto max-h-64 w-full max-w-full rounded-xl border border-slate-700 bg-slate-950 object-contain sm:max-h-72"
                    />
                  </div>
                )}

                {diseaseError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                  >
                    {diseaseError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedImage || diseaseLoading}
                  className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {diseaseLoading
                    ? "🔍 Analyzing Leaf..."
                    : "🔬 Detect Plant Disease"}
                </button>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={clearDiseaseImage}
                    disabled={diseaseLoading}
                    className="mt-3 w-full rounded-xl border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Clear Image
                  </button>
                )}
              </form>
            </section>

            {/* Disease Result */}
            <section
              aria-live="polite"
              className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-6"
            >
              <h4 className="text-xl font-semibold">Disease Analysis</h4>

              {!diseaseResult && !diseaseLoading && (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="text-6xl">🔬</div>
                  <p className="mt-5 text-slate-400">
                    Upload a leaf image to see the prediction here.
                  </p>
                </div>
              )}

              {diseaseLoading && (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-green-500" />
                  <p className="text-slate-300">
                    Analyzing the leaf image...
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Please wait for the model response.
                  </p>
                </div>
              )}

              {diseaseResult && !diseaseLoading && (
                <div className="mt-6 space-y-5">
                  <div className="min-w-0 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 sm:p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">
                      Predicted Class
                    </p>
                    <h5 className="mt-2 break-words text-2xl font-bold text-green-400">
                      {readableDisease}
                    </h5>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-slate-400">
                        Model confidence
                      </span>
                      <span className="font-bold">
                        {Number(diseaseResult.confidence).toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(diseaseResult.confidence) || 0
                            )
                          )}%`,
                        }}
                      />
                    </div>

{diseaseResult.note && (
  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
    <p className="text-sm leading-relaxed text-amber-200">
      ⚠️ {diseaseResult.note}
    </p>
  </div>
)}

                  </div>
                  {advice && (
  <div className="rounded-2xl border border-green-500/20 bg-slate-900 p-5">
    <h3 className="mb-3 text-xl font-bold text-green-400">
      🌿 Disease Treatment & Prevention
    </h3>

    <p className="mb-4 text-slate-300">
      {advice.title}
    </p>

    <h4 className="mb-2 font-semibold text-white">
      Prevention Tips
    </h4>

    <ul className="list-disc space-y-2 pl-5 text-slate-300">
      {(advice?.actions || []).map((tip, index) => (
        <li key={index}>{tip}</li>
      ))}
    </ul>

    <p className="mt-4 text-sm text-yellow-400">
      ⚠️ AI predictions may be incorrect. Confirm the disease
      before applying pesticides or other treatments.
    </p>
  </div>
)}

                  {advice && (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
                      <h5 className="text-lg font-semibold text-white">
                        🌿 {advice.title}
                      </h5>
                      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-300">
                        {advice.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
                    ⚠️ Experimental model: predictions can be wrong,
                    especially on field photos or unfamiliar conditions.
                    Confidence is not a guarantee of correctness. Verify
                    the symptoms with a qualified agricultural expert
                    before taking treatment action.
                  </p>

                  {diseaseResult.note && (
                    <p className="text-xs leading-5 text-slate-500">
                      {diseaseResult.note}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </section>

        
        <div
  id="weather"
  className="mx-auto mt-8 max-w-6xl scroll-mt-28 px-6 pb-8"
>
  <WeatherAdvice />
</div>
<div
  id="fertilizer"
  className="mx-auto mt-8 max-w-6xl scroll-mt-28 px-6 pb-8"
>
  <FertilizerAdvice />
</div>
<div
  id="chatbot"
  className="mx-auto mt-8 max-w-6xl scroll-mt-28 px-6 pb-8"
>
  <FarmingChatbot />
</div>
{/* Footer */}
        <footer className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          AgriSense AI · Intelligent Agriculture Advisor
          <p className="mt-2">
            AI predictions are decision-support tools, not a substitute
            for professional agricultural diagnosis.
          </p>
        </footer> 
      </main>
    </div>
  );
}

export default App;

