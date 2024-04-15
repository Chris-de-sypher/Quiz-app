/** @format */

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const data = {
    email,
    password,
  };

  const url = "http://localhost:4000/user/v1/login";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((message) => {
      const { Errmsg, success } = message;
      if (success) {
        window.location.href = '/user/v1/dashboard';
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
      const { Errmsg } = err;
      console.log(Errmsg);
    });
});
