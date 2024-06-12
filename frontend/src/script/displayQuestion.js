/** @format */

// setting the questions
const link = localStorage.getItem("link");

const url = `http://localhost:4000/user/v1/getquestions/${link}`;
// let questionId;
// let convert;

fetch(url, {
  method: "GET",
})
  .then((res) => res.json())
  .then((data) => {
    const { headTitles, questions } = data;
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
  const container = document.querySelector(".container");

  let score_perQuestion = container.querySelector(".spacing");
  let passing_grade = container.querySelector(".spacing");
  let question = container.querySelector(".question_body");

  countDown();

  submitanswers();
};

// duration -- setting the timer/countdown

function countDown() {
  const container = document.querySelector(".container");
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
      console.log("Countdown complete!");
      sessionStorage.removeItem("countdownTargetTime"); // Clear the stored time
    }
  }, 1000); // Update timer every second
}

// now let's submit the answers
function submitanswers() {
  // get the form parent element
  const container = document.querySelector(".container");

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
                  if (accumulatedScore) {
                    
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


