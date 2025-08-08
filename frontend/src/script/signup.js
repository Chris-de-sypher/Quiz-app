/** @format */

const form = document.querySelector("form");
const fileInput = document.getElementById("avatar");

fileInput.addEventListener("change", function (event) {
  userAvatar = event.target.files[0];
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("avatar", userAvatar);

  const url = "http://localhost:4000/api/v1/auth/signup";

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((message) => {
      const { Errmsg, success } = message;

      if (success) {
        window.location.href = "/api/v1/pages/login";
      }

      if (Errmsg) {
        let msg = document.querySelector("p.msg");
        msg.innerHTML = Errmsg;

        setTimeout(() => {
          msg.innerHTML = "";
        }, 2000);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
