const askQuery = document.getElementById('askQuery');
const botResponse = document.getElementById('botResponse');
const askButton = document.getElementById('submitQuery');

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
let isListening = false; // Flag to track whether the recognition is active

function processSpeechRecognition(text) {
  askQuery.value = text;
  fetch("https://audio-gpt.onrender.com/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      botResponse.value = data.message;
      const utterance = new SpeechSynthesisUtterance(data.message);
      console.log(utterance);
      speechSynthesis.speak(utterance);
      isListening = false; // Stop listening after the first response
      askButton.disabled = false; // Enable the button after the response
    })
    .catch((error) => {
      console.log("Error:", error);
      isListening = false; // Stop listening in case of an error
      askButton.disabled = false; // Enable the button after the error
    });
}

askButton.addEventListener("click", () => {
  if (!isListening) {
    recognition.start();
    isListening = true; // Start listening when the button is clicked
    askButton.disabled = true; // Disable the button while listening
  }
});

recognition.addEventListener("result", (e) => {
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  if (e.results[0].isFinal) {
    processSpeechRecognition(text);
  }
});

recognition.addEventListener("end", () => {
  if (isListening) {
    recognition.start(); // Start listening again after it ends
  }
});
