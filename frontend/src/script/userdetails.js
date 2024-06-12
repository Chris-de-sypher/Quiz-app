/** @format */

/** @format */

const form = document.querySelector("form");

let userEmail;
let userUsername;

fetch("/user/v1/getuserprofile", {
  method: "GET",
})
  .then((res) => res.json())
  .then((data) => {
    const { Email, Username } = data;
    userEmail = Email;
    userUsername = Username;
    console.log(userEmail, userUsername);

    displayUserdetail(userEmail, userUsername);
  })
  .catch((err) => console.log(err));

function displayUserdetail(useremail, userusername) {

  // get the inputs
  let email = document.querySelector("#email");
  email.value = useremail;
  let username = document.querySelector("#username");
  username.value = userusername;


  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const link = document.querySelector("#paste_link").value;

    const decodeLink = decodeURIComponent(link);
    console.log(decodeLink);

    if (email.value === "" || username.value === "" || link === "") {
      return false;
    }

    const sessionData = {
      email: email.value,
      username: username.value,
      url: decodeLink,
    };


    localStorage.setItem("email", sessionData.email);
    localStorage.setItem("username", sessionData.username);
    localStorage.setItem("link", sessionData.url);

    if (true) {
      window.location.href = "/user/v1/answerquestion";
    }
  });
}
