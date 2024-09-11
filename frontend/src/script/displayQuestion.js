/** @format */

const Confettiful = function (el) {
  this.el = el;
  this.containerEl = null;

  this.confettiFrequency = 3;
  this.confettiColors = ["#EF2964", "#00C09D", "#2D87B0", "#48485E", "#EFFF1D"];
  this.confettiAnimations = ["slow", "medium", "fast"];

  this._setupElements();
  this._renderConfetti();
};

Confettiful.prototype._setupElements = function () {
  const containerEl = document.createElement("div");
  const elPosition = this.el.style.position;

  if (elPosition !== "relative" && elPosition !== "absolute") {
    this.el.style.position = "relative";
  }

  containerEl.classList.add("confetti-container");
  this.el.appendChild(containerEl);
  this.containerEl = containerEl;
};

Confettiful.prototype._renderConfetti = function () {
  this.confettiInterval = setInterval(() => {
    // Create a new confetti element
    const confettiEl = document.createElement("div");

    // Set random size for the confetti
    const confettiSize = Math.floor(Math.random() * 3) + 7 + "px";

    // Set a random background color from the confettiColors array
    const confettiBackground =
      this.confettiColors[
        Math.floor(Math.random() * this.confettiColors.length)
      ];

    // Set random horizontal position within the container
    const confettiLeft = Math.floor(Math.random() * this.el.offsetWidth) + "px";

    // Choose a random animation from the confettiAnimations array
    const confettiAnimation =
      this.confettiAnimations[
        Math.floor(Math.random() * this.confettiAnimations.length)
      ];

    // Apply styles and classes to the confetti element
    confettiEl.classList.add(
      "confetti",
      "confetti--animation-" + confettiAnimation
    );
    confettiEl.style.left = confettiLeft;
    confettiEl.style.width = confettiSize;
    confettiEl.style.height = confettiSize;
    confettiEl.style.backgroundColor = confettiBackground;

    // Remove the confetti element after 3 seconds
    confettiEl.removeTimeout = setTimeout(() => {
      if (confettiEl.parentNode) {
        confettiEl.parentNode.removeChild(confettiEl);
      }
    }, 3000);

    // Append the confetti element to the container
    this.containerEl.appendChild(confettiEl);
  }, 25);
};

// setting the questions
const link = localStorage.getItem("link");

const url = `http://localhost:4000/user/v1/getquestions/${link}`;

fetch(url, {
  method: "GET",
})
  .then((res) => res.json())
  .then((data) => {
    const { headTitles, questions, emailNot } = data;
    const html = `<div class="header" data-id="${headTitles.quiz_id}">
    <div class="quiz_name">
      <span>Quiz name</span>
      <span>${headTitles.quiz_name}</span>
    </div>
    <div class="passing_grade">
      <span>passing grade</span>
      <span>${headTitles.passing_grade}%</span>
    </div>
    <div class="score_perQuestion">
      <span>Question score</span>
      <span>${headTitles.score_mark_per_question}%</span>
    </div>
    <div class="total_question">
      <span>Total question</span>
      <span>${headTitles.number_of_question}</span>
    </div>
    <div class="duration">
      <span>Duration</span>
      <span>${headTitles.duration}mins</span>
    </div>
    </div>`;

    document.querySelector(".spacing").innerHTML = html;

    displayQuestions(questions);

    // check if the email was enabled by the quiz creator, if yes then show option to user
    if (emailNot == true) {
      const email_border = document.querySelector(".email_border");
      email_border.hidden = false;
    }
  })
  .catch((err) => console.error(err));

function displayQuestions(items) {
  let arr_of_numbers = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  const newQuestions = items
    .map((question, index) => {
      let questionNumber = arr_of_numbers[index];
      return `
      <div class="question_box fade" data-id="${question._id}">
        <h1><span>${questionNumber}.</span> ${question.heading}</h1>
        <div class="options">
          <input type="radio" name="${question.heading}" id="answer" value="${question.options[0]}"/> <span>${question.options[0]}</span><br />
          <input type="radio" name="${question.heading}" id="" value="${question.options[1]}"/> <span>${question.options[1]}</span><br />
          <input type="radio" name="${question.heading}" id="" value="${question.options[2]}"/> <span>${question.options[2]}</span><br />
          <input type="radio" name="${question.heading}" id="" value="${question.options[3]}"/> <span>${question.options[3]}</span>
        </div>
      </div>`;
    })
    .join("");
  document
    .querySelector(".answerQues")
    .insertAdjacentHTML("beforebegin", newQuestions);

  // slides
  let slideIndex = 1;
  showSlides(slideIndex);

  document.querySelector(".prev").onclick = () => {
    let n = -1;
    showSlides((slideIndex += n));
  };
  document.querySelector(".next").onclick = () => {
    showSlides((slideIndex += 1));
  };

  function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("question_box");
    if (n > slides.length) {
      slideIndex = 1;
    }
    if (n >= slides.length) {
      slideIndex = slides.length;
      document.querySelector(".prev").style.display = "block";
    }

    if (n < 1) {
      slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
  }
}

window.onload = () => {
  const container = document.querySelector(".containers");

  let score_perQuestion = container.querySelector(".spacing");
  let passing_grade = container.querySelector(".spacing");
  let question = container.querySelector(".question_body");

  countDown();

  submitanswers();
};

// duration -- setting the timer/countdown

function countDown() {
  const container = document.querySelector(".containers");
  let durationText = container
    .querySelector(".duration")
    .lastElementChild.textContent.trim();

  // Check if there's a saved target time in sessionStorage or set a new one
  let targetTime = sessionStorage.getItem("countdownTargetTime");
  if (!targetTime) {
    // Remove the "mins" from the duration and convert it to number
    let duration = durationText.includes("mins")
      ? parseInt(durationText)
      : durationText;
    targetTime = new Date().getTime() + duration * 60000; // Convert minutes to milliseconds
    sessionStorage.setItem("countdownTargetTime", targetTime);
  } else {
    targetTime = parseInt(targetTime, 10); // Make sure to parse it as a number
  }

  // Countdown
  let countdown = container.querySelector(".countdown");
  let timer = setInterval(function () {
    let currentTime = new Date().getTime();
    let distance = targetTime - currentTime;

    let minutesRemaining = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    let secondsRemaining = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.innerHTML = `Time left: ${minutesRemaining}m : ${secondsRemaining}s`;

    if (distance < 0) {
      clearInterval(timer);
      countdown.innerHTML = "Time is up!";
      if ((countdown.textContent = "Time is up!")) {
        let result = document.querySelector(".result");
        result.hidden = false;

        window.confettiful = new Confettiful(
          document.querySelector(".js-container")
        );
      }
      console.log("Countdown complete!");
      sessionStorage.removeItem("countdownTargetTime"); // Clear the stored time
    }
  }, 1000); // Update timer every second
}

// now let's submit the answers
function submitanswers() {
  // get the form parent element
  const container = document.querySelector(".containers");

  // get the form to submit the answer
  const SubmitQuestion = container.querySelector("#submitQuestion");
  const questionParent = container.querySelectorAll(".question_box");
  const header = container.querySelector(".spacing .header");
  // now get the quiz id from the header
  let quizId = header.getAttribute("data-id");
  // now get the user email from the localStorage;
  let userEmail = localStorage.getItem("email");

  SubmitQuestion.addEventListener("click", (e) => {
    e.preventDefault();

    // const inputsValue = questionParent.querySelector('input')

    questionParent.forEach((parents) => {
      if (parents.style.display === "block") {
        let questionId = parents.getAttribute("data-id");

        const inputValue = parents.querySelectorAll("input");

        for (let i = 0; i < inputValue.length; i++) {
          let input = inputValue[i];

          if (input.checked) {
            let confirmationText = "Are you sure you wanna submit?";
            let check = confirm(confirmationText);
            if (!check) {
              sessionStorage.setItem("checked", false);
              return;
            }
            sessionStorage.setItem("checked", true);
            let value = input.value;
            let convert = JSON.stringify(value);
            sessionStorage.setItem("answers", convert);

            const data = {
              quizID: quizId,
              questionID: questionId,
              correctanswer: value,
              participantEMail: userEmail,
            };

            const url = "http://localhost:4000/user/v1/saveanswer";

            try {
              fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              })
                .then(async (res) => {
                  const response = res.json();
                  const result = await response;
                  const { error } = result;

                  if (!res.ok) {
                    // Handle non-2xx status codes as errors

                    let modal = document.querySelector(".popup_modal");
                    let Modalmsg = document.querySelector(".alert");
                    Modalmsg.innerHTML = error;
                    modal.classList.add("active_modal");

                    setTimeout(() => {
                      modal.classList.remove("active_modal");
                      Modalmsg.innerHTML = "";
                    }, 2000);
                  }
                  return result;
                })
                .then((data) => {
                  let checked = sessionStorage.getItem("checked");
                  if (checked === "true") {
                    // let inputs = document.querySelectorAll(
                    //   `div[data-id="${questionId}"] input[type = "radio"]`
                    // );
                    // inputs.forEach((input) => {
                    //   input.disabled = true;
                    //   input.checked = true;
                    // });
                  }

                  const { accumulatedScore } = data;
                  console.log(accumulatedScore);

                  if (accumulatedScore) {
                    console.log(true);

                    // we unhide the result
                    let result = document.querySelector(".result");
                    result.hidden = false;

                    // show the congratulations effect
                    window.confettiful = new Confettiful(
                      document.querySelector(".js-container")
                    );

                    // let get the username, score and email
                    let username = document.querySelector(".username");
                    let scoreboard = document.querySelector(".score");
                    let useremail = document.querySelector(".email");

                    // retreive the details from the localstorage and update the user detials
                    let localstorageEmail = localStorage.getItem("email");
                    let localstorageusername = localStorage.getItem("username");

                    username.innerHTML = localstorageusername;
                    useremail.innerHTML = localstorageEmail;
                    scoreboard.innerHTML = accumulatedScore;

                    // store the total score in the localstorage
                    localStorage.setItem("total_score", accumulatedScore);
                  }
                })
                .catch((err) => console.log(err));
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    });
  });
}

// let trigger the email send button
let disable_emailNot = document.querySelector("#disable_email");
let send_email = document.querySelector("#send_email");

// check if it is active
if (!disable_emailNot.hidden == true) {
  send_email.addEventListener("click", (e) => {
    e.preventDefault();

    // get the email, username and quiz id from the localstorage
    let username = localStorage.getItem("username");
    let useremail = localStorage.getItem("email");
    let quizID = localStorage.getItem("link");
    let total_score = localStorage.getItem("total_score");

    if (username === "" || useremail === "" || quizID === "" || total_score === '') {
      console.log("Empty variables");
      return;
    }

    const data = {
      username,
      useremail,
      quizID,
      total_score
    };

    let url = "http://localhost:4000/user/v1/emailNotification";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((msg) => console.log(msg))
      .catch((err) => console.log(err));
  });
}
