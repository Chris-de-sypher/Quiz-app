/** @format */

const submitBtn = document.querySelector("form");
const cancel = document.querySelector(".cancel");

submitBtn.addEventListener("submit", submitFunction);

function submitFunction(e) {
  e.preventDefault();

  const title = document.querySelector("#title").value.trim();
  const description = document.querySelector("#description").value.trim();
  const start_date = document.querySelector("#start").value;
  const expired_date = document.querySelector("#end").value;
  const duration = document.querySelector("#duration").value;
  const score_mark_per_question = document.querySelector("#passing_mark").value;
  const total_score_percentage =
    document.querySelector("#score_percentage").value;
  const total_number_of_question = document.querySelector(
    "#total_number_of_question"
  ).value;
  const email_notifications = document.querySelector(
    "input[name='email']:checked"
  ).value;

  const data = {
    title,
    description,
    start_date,
    expired_date,
    duration,
    score_mark_per_question,
    total_score_percentage,
    email_notifications,
    total_number_of_question,
  };

  console.log(data);

  fetch("http://localhost:4000/user/v1/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((message) => {
      if (message.success) {
        window.location.href = "/user/v1/question"; // Redirect on success
      } else if (message.ErrMsg) {
        const msg = document.querySelector("p.msg");
        msg.textContent = message.ErrMsg;
        setTimeout(() => (msg.textContent = ""), 2000);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Failed to submit quiz. Please try again.");
    });

  document.querySelector("form").reset(); // Reset the form after submission
}

cancel.onclick = () => {
  if (confirm("Do you wish to terminate?")) {
    document.querySelector("form").reset(); // Reset the form on confirmation
  }
};
