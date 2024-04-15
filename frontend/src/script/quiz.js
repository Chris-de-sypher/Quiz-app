/** @format */

const submitBtn = document.querySelector("form");
const cancel = document.querySelector(".cancel");

submitBtn.addEventListener("submit", submitFunction);

function submitFunction(e) {
  e.preventDefault();

  // get the title and desc
  let heading = document.querySelector("#title");
  let desc = document.querySelector("#description");
  let start_Date = document.querySelector("#start");
  let end_date = document.querySelector("#end");
  let total_percentage_score = document.querySelector("#score_percentage");
  let score_mark = document.querySelector("#passing_mark");
  let durations = document.querySelector("#duration");
  let total_numberQuestion = document.querySelector("#total_number_of_question");
  let email_not = document.querySelectorAll("input[type='radio'][name='email']");
  let selectedValue = null;

  email_not.forEach(option => {
    if (option.checked) {
      selectedValue = option.value;
    }
  })

  console.log();

  let title = heading.value;
  let description = desc.value;
  let start_date = start_Date.value;
  let expired_date = end_date.value;
  let duration = durations.value;
  let score_mark_per_question = score_mark.value;
  let total_score_percentage = total_percentage_score.value;
  let total_number_of_question = total_numberQuestion.value


  const data = {
    title,
    description,
    start_date,
    expired_date,
    duration,
    score_mark_per_question,
    total_score_percentage,
    selectedValue,
    total_number_of_question,
  };

  const url = "http://localhost:4000/user/v1/quiz";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((message) => {
      const { ErrMsg, success } = message;

      if (success) {
        window.location.href = "/user/v1/question";
      }

      if (ErrMsg) {
        let msg = document.querySelector("p.msg");
        msg.innerHTML = ErrMsg;

        setTimeout(() => {
          msg.innerHTML = "";
        }, 2000);
      }

      title = "";
      description = "";
    })
    .catch((err) => {
      console.log(err);
    });
}

cancel.onclick = () => {
  const mss = "Do you wish to terminate?";
  const prompts = confirm(mss);

  if (prompts) {
    const title = document.querySelector("#title");
    const description = document.querySelector("#description");

    title.value = "";
    description.value = "";
  } else {
    alert("not canceled");
    window.location.href = "/user/v1/quiz";
  }
};
