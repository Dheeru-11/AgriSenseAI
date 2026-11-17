
export const diseaseAdvice = {
  "Tomato___Bacterial_spot": {
    description:
      "Bacterial spot can cause dark spots on tomato leaves and may affect fruit.",
    prevention: [
      "Avoid watering directly onto leaves.",
      "Improve airflow between plants.",
      "Remove heavily affected leaves using clean tools.",
      "Avoid handling plants when their leaves are wet.",
    ],
  },

  "Tomato___Early_blight": {
    description:
      "Early blight is a fungal disease that often causes brown spots with ring-like patterns.",
    prevention: [
      "Remove affected leaves carefully.",
      "Water near the base of the plant.",
      "Use mulch to reduce soil splashing onto leaves.",
      "Rotate crops and remove infected plant debris.",
    ],
  },

  "Tomato___Late_blight": {
    description:
      "Late blight can spread quickly during cool, humid conditions.",
    prevention: [
      "Separate suspicious plants where possible.",
      "Avoid overhead watering.",
      "Remove infected plant material according to local guidance.",
      "Contact a local agricultural expert promptly if symptoms spread.",
    ],
  },

  "Pepper,_bell___Bacterial_spot": {
    description:
      "Bacterial spot can produce dark lesions on pepper leaves and fruit.",
    prevention: [
      "Avoid overhead irrigation.",
      "Use clean gardening tools.",
      "Improve spacing and airflow.",
      "Remove badly affected plant material carefully.",
    ],
  },
};

export function getDiseaseAdvice(predictedClass) {
  return (
    diseaseAdvice[predictedClass] || {
      description:
        "This prediction needs confirmation before selecting a treatment.",
      prevention: [
        "Inspect the plant for additional symptoms.",
        "Avoid excessive watering and improve airflow.",
        "Keep gardening tools clean.",
        "Consult a local agricultural expert for a confirmed diagnosis.",
      ],
    }
  );
}
