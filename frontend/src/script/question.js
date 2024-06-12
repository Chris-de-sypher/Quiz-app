/** @format */

const checkTextareaLength = () => {
  let textarea = document.querySelector("#question");
  const increament = document.querySelector(".increase");
  const total_length = document.querySelector(".total-length");

  // check for the length of textarea
  textarea.addEventListener("input", (e) => {
    e.preventDefault();

    let content = e.target.value;

    const words = content.trim().split(/\s+/);
    // const textLength = content.trim().split(/\s+/);
    const checkLength = parseInt(words.length);
    increament.innerHTML = "";
    increament.innerHTML = checkLength;
    // convert the total length into a number
    const max_number = Number(total_length.textContent);

    // check if the increment is equal to the max_number;
    if (checkLength >= max_number) {
      console.log(true);
      document.querySelector(".textarea").style.color = "red";

      content = words.slice(0, max_number).join(" ");

      // Update the textarea value
      textarea.value = content;
    }
  });
};

checkTextareaLength();

// submit the data

const form = document.querySelector("#questionForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let textarea = document.querySelector("#question");

  let heading = textarea.value;

  let option1 = document.querySelector("#option1").value;
  let option2 = document.querySelector("#option2").value;
  let option3 = document.querySelector("#option3").value;
  let option4 = document.querySelector("#option4").value;
  let correctAnswer = document.querySelector("#correctAnswer").value;

  console.log(typeof correctAnswer);

  const data = {
    heading,
    option1,
    option2,
    option3,
    option4,
    correctAnswer,
  };

  if (
    heading === "" ||
    option1 === "" ||
    option2 === "" ||
    option3 === "" ||
    option4 === "" ||
    correctAnswer === ""
  ) {
    return false;
  }

  const url = "http://localhost:4000/user/v1/question";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((message) => {
      const { success, limit, ErrMsg, number_questions } = message;

      let questions_length = document.querySelector(".number_questions");

      questions_length.innerHTML = number_questions;

      if (success) {
        let modal = document.querySelector(".popup_modal");
        let Modalmsg = document.querySelector(".alert");
        Modalmsg.innerHTML = success;
        modal.classList.add("active_modal");

        setTimeout(() => {
          modal.classList.remove("active_modal");
          Modalmsg.innerHTML = "";
        }, 2000);
      }

      if (ErrMsg) {
        let msg = document.querySelector("p.msg");
        msg.innerHTML = ErrMsg;

        setTimeout(() => {
          msg.innerHTML = "";
        }, 2000);
      }
      if (limit) {
        // // Specify the URL of the page you want to open in the pop-up
        // const url = "http://localhost:4000/user/v1/confirm";
        // // Specify the dimensions and other properties of the pop-up window
        // const width = 600;
        // const height = 400;
        // const left = (window.innerWidth - width) / 2;
        // const top = (window.innerHeight - height) / 2;
        // const options = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        // // Open the pop-up window
        // window.open(url, "Popup", options);
        alert(
          "You've reached the limit of your question, now you will be redirected"
        );

        window.location.href = "/user/v1/dashboard";
      }
      document.querySelector("#question").value = "";
      document.querySelector("#option1").value = "";
      document.querySelector("#option2").value = "";
      document.querySelector("#option3").value = "";
      document.querySelector("#option4").value = "";
      document.querySelector("#correctAnswer").value = "";
    })
    .catch((err) => console.log(err));
});
