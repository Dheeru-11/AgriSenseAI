# 🌾 AgriSense AI – Intelligent Agriculture Advisor

An AI-powered agriculture advisory web application designed to help users make informed farming decisions using Machine Learning, Deep Learning, and modern web technologies.

🔗 **Live Website:** https://agri-sense-ai-coral.vercel.app

## 📌 About the Project

AgriSense AI is an intelligent agriculture advisory platform that combines artificial intelligence with web development to provide crop recommendations, plant disease predictions, weather-based advice, and fertilizer guidance.

The project aims to demonstrate how AI can support agricultural decision-making through an accessible and user-friendly website.

## ✨ Key Features

- 🌱 **Crop Recommendation:** Predicts a suitable crop based on nitrogen, phosphorus, potassium, temperature, humidity, soil pH, and rainfall.
- 🍃 **Plant Disease Detection:** Uses deep learning to classify uploaded plant leaf images into disease or healthy categories.
- 🌤️ **Weather Advisory:** Provides weather-related agricultural guidance.
- 🧪 **Fertilizer Guidance:** Offers fertilizer-related recommendations.
- 💬 **Agricultural Chatbot:** Answers basic farming-related questions.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Machine Learning | scikit-learn, Pandas, Joblib |
| Deep Learning | PyTorch, torchvision, MobileNetV3 Small |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 🧠 Machine Learning Models

### Crop Recommendation Model

The model uses seven input parameters:

- Nitrogen (N)
- Phosphorus (P)
- Potassium (K)
- Temperature
- Humidity
- Soil pH
- Rainfall

**Recorded evaluation accuracy:** 99.55%

### Plant Disease Detection Model

- **Architecture:** MobileNetV3 Small
- **Dataset:** PlantVillage
- **Classification categories:** 38
- **Validation accuracy:** 87.89%

*Note: Evaluation accuracy does not guarantee the same performance under real-world farming conditions.*

## 🏗️ System Architecture

```text
             User / Farmer
                   |
                   v
           React + Vite Frontend
                (Vercel)
                   |
          ---------------------
          |                   |
          v                   v
  Crop Recommendation    Disease Detection
       FastAPI                FastAPI
       (Render)               (Render)
          |                   |
          v                   v
    Trained ML Model     MobileNetV3 Small
          |                   |
          ---------------------
                   |
                   v
           Prediction Result
```

Weather Advisory, Fertilizer Guidance, and Agricultural Chatbot are additional features available through the frontend.

## 🚀 Live Deployment

**Frontend:**  
https://agri-sense-ai-coral.vercel.app

**Crop Recommendation API:**  
https://agrisense-crop-api.onrender.com

**Plant Disease Detection API:**  
https://agrisense-disease-api.onrender.com

## 🧪 Testing

The application has been tested with sample agricultural inputs and plant leaf images.

Example crop recommendation input:

```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 25,
  "humidity": 80,
  "ph": 6.5,
  "rainfall": 200
}
```

**Predicted crop:** Rice

## ⚠️ Current Limitations

- Disease predictions may be unreliable for non-leaf images or images outside the training distribution.
- The agricultural chatbot currently supports basic questions and may return generic answers.
- Recommendations should be treated as decision-support information rather than guaranteed agricultural outcomes.

## 🔮 Future Enhancements

- Multilingual support for farmers
- Improved agricultural chatbot
- Better plant image validation
- Larger real-world disease datasets
- More personalized agricultural recommendations

## 👨‍💻 Project Developer

**Dheeraj Singh Gurjar**  
Department of Computer Science & Engineering  
Career Point University, Kota, Rajasthan

**Project Supervisor:** Harsh Verma, Assistant Professor (CSE)

**Academic Session:** July–December 2026

## 📄 Academic Project

Developed as a college project to explore practical applications of Artificial Intelligence, Machine Learning, Deep Learning, and full-stack web development.

---

⭐ If you find this project useful, consider starring the repository.
