const dropdownButton = document.getElementById('dropdownButton');
const dropdownContent = document.getElementById('dropdownContent');

dropdownButton.addEventListener('click', () => {
  dropdownContent.classList.toggle('show-dropdown');
});

// Store the selected language in user_lang variable
let user_lang = '';

const dropdownOptions = document.querySelectorAll('.dropdown-option');
dropdownOptions.forEach(option => {
  option.addEventListener('click', () => {
    user_lang = option.getAttribute('data-lang');
    dropdownButton.textContent = user_lang;
    dropdownContent.classList.remove('show-dropdown');
  });
});



const musicToggle = document.getElementById('music-toggle');
const backgroundMusic = document.getElementById('background-music');

let isMusicPlaying = false;

musicToggle.addEventListener('click', () => {
  if (isMusicPlaying) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
  isMusicPlaying = !isMusicPlaying;
});
backgroundMusic.volume = 0.03;

const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let isFirstClick = true;
let userMessage = null; 
const API_KEY = "YOUR_API_KEY"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

chatbotToggler.addEventListener("click", () => {
    if (isFirstClick) {
        isFirstClick = false; 
        chatbotToggler.classList.add("clicked"); 
    }
});

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; 
}

const handleMicInput = () => {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
        const userVoiceText = event.results[0][0].transcript;

        const textarea = document.getElementById("TextId");
        textarea.value = userVoiceText;

      const speechToTextApiUrl = "YOUR_API_URL";
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "audio/wav",
                "Authorization": "Bearer YOUR_API"
            },
            body: userVoiceText
        };

        fetch(speechToTextApiUrl, requestOptions)
            .then(response => response.text())
            .then(text => {
                textarea.value = text;
            })
            .catch(error => {
                console.error("Error sending audio to IBM Speech to Text:", error);
            });
    };
};
const micButton = document.getElementById("mic-btn");
micButton.addEventListener("click", handleMicInput);

const analyzeSentiment = async (text) => {
  const NLU_API_KEY = "YOUR_API_KEY";
  const NLU_URL = "YOUR_API_URL";
  
  const requestOptions = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa("apikey:" + NLU_API_KEY)}`
      },
      body: JSON.stringify({
          text,
          features: {
              sentiment: {}
          }
      })
  };

  const response = await fetch(NLU_URL + "/v1/analyze?version=2021-08-01", requestOptions);
  const data = await response.json();

  const sentimentScore = data.sentiment.document.score;
  if (sentimentScore > 0.2) {
      return "positive";
  } else if (sentimentScore < -0.2) {
      return "negative";
  } else {
      return "neutral";
  }
};
const analyzeEmotions = (message) => {
  const emotionsMapping = {
      "hungry": ["hungry", "starving", "food","party","dish","curry"],
      "curious": ["curious", "wonder"],
      "confused": ["confused", "puzzled"],
      "sleepy": ["sleepy", "tired"],
      "fear": ["fear", "scared", "terrified"],
      "learning": [
        "skills", "experience", "qualifications", "training", "mentorship",
        "goals", "development", "self-improvement", "learning opportunities",
        "skill development", "industry trends"
    ],
    "employment": [
        "job", "jobs", "position", "employment", "opportunities", "resume",
        "interview", "application", "hiring", "salary", "promotion",
        "advancement", "work", "responsibilities", "role", "job market",
        "job fair", "career guidance", "job application", "networking events",
        "career development", "about_job"
    ],
    "skills": [
        "skills", "experience", "qualifications", "professional", "industry",
        "work", "responsibilities", "role", "job application", "portfolio",
        "skillset", "learning opportunities", "skill development",
        "industry trends", "professional growth"
    ],
    "about_job": [
        "company", "position", "job search", "industry", "career", "opportunities",
        "employment", "skills", "experience", "qualifications", "role",
        "responsibilities", "career guidance", "industry trends", "about_job"
    ]
  };

  message = message.toLowerCase(); 

  const detectedEmotions = [];
  for (const emotion in emotionsMapping) {
      const keywords = emotionsMapping[emotion];
      const foundKeyword = keywords.some(keyword => message.includes(keyword));
      if (foundKeyword) {
          detectedEmotions.push(emotion);
      }
  }

  return detectedEmotions;
};

const generateResponse = async(chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    const sentiment = await analyzeSentiment(userMessage);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a Indian chatbot providing support for Indian domestic violence reporting, Indian mental health counseling, career guidance, and emergency contacts. If you feel user is in emergency or need help immediately then give the following contacts:India: Police: 100, Medical Emergency (Ambulance): 108, Fire Department: 101, Women's Helpline: 181, Child Helpline: 1098, Senior Citizens Helpline: 1091, Disaster Management: 1070, Anti-Poison Helpline: 011-1066. Answer this User Question:" },
                { role: "user", content: userMessage }
            ],
        }),
    };

    
    fetch(API_URL, requestOptions)
        .then((res) => res.json())
        .then(async(data) => {
            const chatResponse = data.choices[0].message.content.trim();
            messageElement.textContent = chatResponse;
            const emotions = await analyzeEmotions(userMessage); 
            
        let emoji = "";
        if (sentiment === "positive") {
            emoji = "😀";
        } else if (emotions.includes("sleepy")) {
          emoji = "😴";
        } else if (emotions.includes("hungry")) {
          emoji = "🍔";
        } else if (emotions.includes("learning")) {
          emoji = "📗";
        } else if (emotions.includes("employment")) {
          emoji = "💼";
        } else if (emotions.includes("skills")) {
          emoji = "💡";
        } else if (emotions.includes("about_job")) {
          emoji = "🎯";
        } else if (sentiment === "neutral") {
            emoji = "🙂";
        } else if (sentiment === "negative") {
            emoji = "😔";
        }

        
        messageElement.textContent = chatResponse + emoji;
            const speakerIcon = document.createElement("span");
            speakerIcon.id = "Speaker";
            speakerIcon.classList.add("material-symbols-outlined");
            speakerIcon.textContent = "volume_up";
            chatElement.appendChild(speakerIcon);

            speakerIcon.addEventListener("click", () => {
                const textToSpeak = chatResponse;

                if ('speechSynthesis' in window) {
                    const synth = window.speechSynthesis;
                    const utterance = new SpeechSynthesisUtterance(textToSpeak);
                    synth.speak(utterance);
                } else {
                    console.log("Web Speech API is not supported in this browser.");
                }
            });
          const languageIcon = document.createElement("span");
            languageIcon.id = "Language";
            languageIcon.classList.add("material-symbols-outlined");
            languageIcon.textContent = "translate"; // Icon for translation
            chatElement.appendChild(languageIcon); 
// -----------------------------------------------------------------------------
            
              languageIcon.addEventListener("click", () => {
                  translateToLaguage(chatResponse);
              });
              async function translateToLaguage(textToTranslate) {
                const API_KEY = "YOUR_KEY"; // Replace with your OpenAI API key
                const API_URL = "https://api.openai.com/v1/engines/text-davinci-002/completions";
              
                try {
                  const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${API_KEY}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      prompt: `Translate this text to ${user_lang} Perfectly as short as possible: ${textToTranslate}`,
                      max_tokens: 2000, 
                    }),
                  });
              
                  if (response.ok) {
                    const data = await response.json();
                    const translation = data.choices[0].text;
                    displayTranslation(translation);
                  } else {
                    console.error("Error translating text.");
                  }
                } catch (error) {
                  console.error("Error translating text:", error);
                }
              }

              function displayTranslation(translation) {
                const chatResponse = `${translation.trim()}`;
                messageElement.textContent = chatResponse;
              }

languageIcon.addEventListener("click", async () => {
  const translatedText = await translateToLaguage(chatResponse);

  if (translatedText) {
    displayTranslation(translatedText, messageElement);
    speakTranslatedText(translatedText);
  }
});

function speakTranslatedText(translatedText) {
  if ('speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    synth.speak(utterance);
  } else {
    console.log("Web Speech API is not supported in this browser.");
  }
}
        })
        .catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "Your Chat-GPT, OpenAI key is expired / not placed, try a new key with $5 credit for free , Oops! Something went wrong. Please try again.";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const handleChat = () => {
    const responseSound = document.getElementById("responseSound");
    responseSound.play();
    userMessage = chatInput.value.trim(); 
    if(!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    const watsonAssistantUrl = "YOUR_WATSON_ASSISTANT_API_URL";
    const watsonAssistantApiKey = "YOUR_WATSON_ASSISTANT_API_KEY";  
    
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 100);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));


document.addEventListener("DOMContentLoaded", function () {
    const robotIconContainer = document.querySelector(".robot-icon-container");
    const chatbot = document.querySelector(".chatbot");
    const modelContainer = document.querySelector(".model-container");
    let isExpanded = false;
  
    robotIconContainer.addEventListener("click", function () {
      if (!isExpanded) {
        chatbot.classList.add("expanded");
        modelContainer.style.display = "flex"; 
        setTimeout(() => {
          modelContainer.style.left = "50%"; 
          modelContainer.style.top = "50%"; 
          modelContainer.style.opacity = "1";
          modelContainer.style.transform = "translate(-50%, -50%) scale(1)"; 
          readAloud("Hello, I am AI powered Chat-Robot. You can talk to me.");
        }, 100);
      } else {
        chatbot.classList.remove("expanded");
        modelContainer.style.transform = "translate(-50%, -50%) scale(0)"; // 
        modelContainer.style.opacity = "0";
        setTimeout(() => {
          modelContainer.style.display = "none";
        }, 100);
      }
      isExpanded = !isExpanded;
    });
  });
  

const readAloud = (text) => {
    if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
         utterance.lang = 'en-US'; 
        synth.speak(utterance);
    } else {
        console.log("Web Speech API is not supported in this browser.");
    }
};

const voiceButton = document.getElementById("voiceButton");
const dots = document.querySelector(".dots");
const micSymbol = document.querySelector(".material-symbols-rounded");

voiceButton.addEventListener("click", () => {
  micSymbol.style.display = "none"; 
  dots.style.display = "block"; 
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = async (event) => {
    const userVoiceText = event.results[0][0].transcript;

    const API_KEY = "YOUR_API_KEY"; // Replace with your API key
    const API_URL = "YOUR_API_URL";
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a Indian chatbot providing support for Indian domestic violence reporting, Indian mental health counseling, career guidance, and emergency contacts. If you feel user is in emergency or need help immediately then give the following contacts: India: Police: 100, Medical Emergency (Ambulance): 108, Fire Department: 101, Women's Helpline: 181, Child Helpline: 1098, Senior Citizens Helpline: 1091, Disaster Management: 1070, Anti-Poison Helpline: 011-1066.And answer everything in brief" },
                { role: "user", content: userVoiceText }
            ],
        }),
    };

    try {
      const res = await fetch(API_URL, requestOptions);
      const data = await res.json();
      const chatResponse = data.choices[0].message.content.trim();

      readAloud(chatResponse);
    } catch (error) {
      console.error("Error sending request to OpenAI:", error);
    }
    finally {
      setTimeout(() => {

        micSymbol.style.display = "block";
        dots.style.display = "none";
    }, 300); 
  }
  };
});

document.addEventListener("DOMContentLoaded", function () {
  const emergencyButton = document.getElementById("emergency-button");
  const callPoliceButton = document.getElementById("call-police-button");
  const userPhoneNumber = document.getElementById("user-phone-number");
  const userLocation = document.getElementById("user-location");
  const popupBox = document.getElementById("popup-box"); 
  const closePopupButton = document.getElementById("close-button"); 
  const confirmationPopup = document.getElementById("confirmation-popup");

  let isPopupOpen = false;

  function togglePopup() {
    if (isPopupOpen) {
      popupBox.style.display = "none"; 
    } else {
      popupBox.style.display = "block"; 
    }
    isPopupOpen = !isPopupOpen;
  }

  closePopupButton.addEventListener("click", function () {
    togglePopup();
  });

  emergencyButton.addEventListener("click", function () {
    togglePopup();
  });

function playButtonClickSound() {
  const audio = new Audio("button_click.m4a");
  audio.play();
}

  function sendTelegramMessage(chatId, message) {
    const botToken = "YOUR_BOT_TOKEN";

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Message sent successfully:", data);
        playButtonClickSound();
        showConfirmationPopup();
      })
      .catch(error => {
        console.error("Error sending message:", error);
      });
  }

  function showConfirmationPopup() {
    document.getElementById("popup-box").style.display = "none";
    confirmationPopup.style.display = "block";
    setTimeout(function () {
      confirmationPopup.style.display = "none";
    }, 5000); 
  }

  callPoliceButton.addEventListener("click", function () {
    const phoneNumber = userPhoneNumber.value;
    const location = userLocation.value;

    if (!phoneNumber || !location) {
      alert("Please enter both phone number and location.");
      return;
    }

    const policeChatId = YOUR_CHAT_ID";
    const message = `EMERGENCY HELP NEEDED...\nLocation: ${location}\nPhone Number: ${phoneNumber}`;

    sendTelegramMessage(policeChatId, message);
  });

  emergencyButton.addEventListener("click", function () {
    document.getElementById("popup-box").style.display = "block";
  });
});




