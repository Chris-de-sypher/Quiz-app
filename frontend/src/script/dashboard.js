/** @format */

const side_bar = document.querySelector(".side_bar");
let quizes = [];

const increaseWidth = document.querySelector(".increaseWidth");
const descreaseWidth = document.querySelector(".descreaseWidth");

descreaseWidth.addEventListener("click", (e) => {
  e.preventDefault();

  // get the value of with from the data att
  const resizeWidth = e.target.dataset.resize;

  side_bar.style.width = resizeWidth + "px";
  descreaseWidth.classList.add("hidden");
  increaseWidth.classList.remove("hidden");
});

increaseWidth.addEventListener("click", (e) => {
  e.preventDefault();

  // get the value of with from the data att
  const resizeWidth = e.target.dataset.resize;

  side_bar.style.width = resizeWidth + "px";
  increaseWidth.classList.add("hidden");
  descreaseWidth.classList.remove("hidden");
});

// show password on chnage password form
const eyes = document.querySelectorAll("label .fa-eye");

eyes.forEach((eye) => {
  eye.addEventListener("click", (e) => {
    e.preventDefault();

    let sibling = e.target.previousElementSibling;

    if (sibling.type == "password") {
      sibling.type = "text";
    } else if (sibling.type == "text") {
      sibling.type = "password";
    }
  });
});

// links
const menu = document.querySelectorAll(".menu .data");
const display = document.querySelector(".display-content");

menu.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // get the data att
    const data_id = e.target.dataset.id;
    const content = document.getElementById(data_id);

    // Show the content section that corresponds to the clicked menu item
    if (content) {
      document.getElementById("analytic-section").style.display = "none";
      display.style.display = "block";
      display.innerHTML = "";
      display.appendChild(content.cloneNode(true));
      // get the contents and dsiplay them
      const displayChildren = display.querySelector(`#${data_id}`);
      displayChildren.style.display = "block";
      // show password on chnage password form
      const eyes = document.querySelectorAll("label .fa-eye");

      eyes.forEach((eye) => {
        eye.addEventListener("click", (e) => {
          e.preventDefault();

          let sibling = e.target.previousElementSibling;

          if (sibling.type == "password") {
            sibling.type = "text";
          } else if (sibling.type == "text") {
            sibling.type = "password";
          }
        });
      });

      // edit icon and delete icons
      const inputs = display.querySelectorAll(".quiz-box input[class='data']");

      inputs.forEach((input) => {
        input.addEventListener("mouseover", (e) => {
          e.preventDefault();

          const nextSibling = e.target.nextElementSibling;
          const nextNextSibling =
            e.target.nextElementSibling.nextElementSibling;

          nextSibling.classList.remove("inactive-icon");
          nextSibling.classList.add("active-icon");
          nextNextSibling.classList.remove("inactive-icon");
          nextNextSibling.classList.add("active-icon");
        });
      });

      inputs.forEach((input) => {
        input.addEventListener("mouseout", (e) => {
          e.preventDefault();

          const nextSibling = e.target.nextElementSibling;
          const nextNextSibling =
            e.target.nextElementSibling.nextElementSibling;

          setInterval(() => {
            nextSibling.classList.add("inactive-icon");
            nextSibling.classList.remove("active-icon");
            nextNextSibling.classList.add("inactive-icon");
            nextNextSibling.classList.remove("active-icon");
          }, 6000);
        });
      });

      // change password
      const change_password = document.querySelector("#change_password");
      console.log(change_password);

      change_password.addEventListener("submit", (e) => {
        e.preventDefault();

        const old_password = document
          .querySelector("#old-password")
          .value.trim();
        const new_password = document
          .querySelector("#new-password")
          .value.trim();
        const confirm_password = document
          .querySelector("#confirm_password")
          .value.trim();

        // Check if any field is empty
        if (!old_password || !new_password || !confirm_password) {
          console.log("Please fill in all fields");
          return;
        }

        // Check if the new password is the same as the old password
        if (old_password === new_password) {
          console.log("New password must be different from the old password.");
          return; // Exit the function early
        }

        // Check if the new password matches the confirm password
        if (new_password !== confirm_password) {
          console.log("New password and confirm password do not match.");
          return;
        }

        const data = {
          old_password,
          new_password,
        };

        const url = "http://localhost:4000/user/v1/changepassword";

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
              let msg = document.querySelector("p.msg");
              msg.innerHTML = success;

              setTimeout(() => {
                msg.innerHTML = "";
              }, 2000);
            }
            if (ErrMsg) {
              let msg = document.querySelector("p.msg");
              msg.innerHTML = ErrMsg;

              setTimeout(() => {
                msg.innerHTML = "";
              }, 2000);
            }

            document.querySelector("#old-password").value = "";
            document.querySelector("#new-password").value = "";
            document.querySelector("#confirm_password").value = "";
          })
          .catch((err) => {
            console.log(err);
          });
      });

      // get the quizzes of the user
      function fetchQuizes() {
        fetch("http://localhost:4000/user/v1/getuserquiz")
          .then((res) => res.json())
          .then((data) => {
            if (data.length === 0) {
              return (document.querySelector(".quiz-parent-box").innerHTML =
                "<h2>User quiz is empty</h2>");
            }
            displayquiz(data);
          })
          .catch((err) => console.log(err));
      }

      fetchQuizes();

      function displayquiz(data) {
        const EachQuiz = data
          .map((item) => {
            // // Example start and end date strings retrieved from the database
            const startDateString = item.start_date;
            const endDateString = item.expired_date;

            // Parse the start and end date strings into Date objects
            const startDate = new Date(startDateString);
            const endDate = new Date(endDateString);

            // Check if the start date is before the end date
            if (startDate < endDate) {
              console.log("Start date is before end date");
            } else if (startDate > endDate) {
              console.log("Start date is after end date");
            } else {
              console.log("Start date is equal to end date");
            }

            // Calculate the duration between the start and end dates in milliseconds
            const durationMilliseconds = endDate - startDate;

            // Convert the duration to days
            const durationDays =
              Math.floor(durationMilliseconds / (1000 * 60 * 60 * 24)) +
              " Days left";
            console.log(`Duration: ${durationDays} days`);

            // conver the start date and end date to yyyy-mm-dd format
            const startDateFormat = new Date(startDateString);
            const getTheYear = String(startDateFormat.getUTCFullYear());
            const getTheMonth = String(startDateFormat.getMonth());
            const getTheDay = String(startDateFormat.getDay());
            const format = `${getTheMonth}/${getTheDay}/${getTheYear}`;
            console.log(format);

            // conver the start date and end date to yyyy-mm-dd format
            const EndDateFormat = new Date(endDateString);
            const getTheYearFormat = String(EndDateFormat.getFullYear());
            const getTheMonthFormat = String(EndDateFormat.getMonth());
            const getTheDayFormat = String(EndDateFormat.getDay());
            const formats = `${getTheMonthFormat}/${getTheDayFormat}/${getTheYearFormat}`;
            console.log(formats);

            return `<div class="quiz-box" data-id="${item._id}">
            <div class="check_to_delete"><input type="checkbox" id="checkers"/></div>
          <form>
            <div class="title">
            <label for="title">title</label>
              <input
                type="text"
                name="title"
                id="title"
                class="data"
                placeholder="title"
                value="${item.title}"
              />
              <span class="fa-solid fa-pen" data-id="title"></span>
            </div>
            <div class="desc">
            <label for="description">description</label>
              <input
                type="text"
                name="description"
                id="description"
                placeholder="description"
                class="data"
                value="${item.description}"
              />
              <span class="fa-solid fa-pen" data-id="description"></span>
            </div>
            
            <div class="question_le">
              <label for="question_length">Total number of questions</label>
              <input
                type="number"
                name="question_length"
                id="question_length"
                placeholder="Question length"
                class="data"
                value="${item.total_number_of_question}"
              />
              <span class="fa-solid fa-pen" data-id="question_length"></span>
            </div>
            <div class="duration">
              <label for="duration">duration</label>
              <input
                type="number"
                name="duration"
                id="duration"
                placeholder="duration"
                class="data"
                value="${item.duration}"
              />
              <span class="fa-solid fa-pen" data-id="duration"></span>
            </div>
            
            <div class="score_per_question">
              <label for="score_per_question">Score per question</label>
              <input
                type="number"
                name="score_per_question"
                id="score_per"
                placeholder="score per question"
                class="data"
                value="${item.score_mark_per_question}"
              />
              <span class="fa-solid fa-pen" data-id="score_per"></span>
            </div>
            <div class="score_percentage">
              <label for="total_score_percentage">Percentage score</label>
              <input
                type="number"
                name="total_score_percentage"
                id="total_score"
                placeholder="Total score percentage"
                class="data"
                value="${item.total_score_percentage}"
              />
              <span class="fa-solid fa-pen" data-id="total_score"></span>
            </div>
            
            <div class="start_date">
              <label for="start_date">Start Date</label>
              <input
                type="text"
                name="start_date"
                id="start_date"
                placeholder="start_date"
                class="data"
                value="${format}"
              />
              <span class="fa-solid fa-pen" data-id="start_date"></span>
            </div>
            
            <div class="end_date">
              <label for="end_date">End Date</label>
              <input
                type="text"
                name="end_date"
                id="end_date"
                placeholder="end_date"
                class="data"
                value="${formats}"
              />
              <span class="fa-solid fa-pen" data-id="end_date"></span>
            </div>
            <div class="Time-left">
              <label for="end_date">Time left</label>
              <input
                type="text"
                name="time_left"
                id="time_left"
                placeholder="time_left"
                class="data"
                disabled
                value="${durationDays}"
              />
            </div>
            
            <!-- participants and their email -->
            <div class="email_and_username">
            <label for="username">username:</label> 
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value="${item.participant_username}"
              />
            <label for="email">email</label>
              <input type="email" name="email" id="email" placeholder="Gmail" value="${item.participant_email}"/>
            </div>
              <div class="link">
              <div class="generate_uniqueLink">   <label for="link">Quiz link</label> <input type="text" id="link" name="links" value="${item.generate_unique_link}"><i class="fa-solid fa-copy" id="copy-icon"></i></div>
              <div class="createdAt"> <label for="CreatedAt">CreatedAt</label> <input type="text" name="" value="${item.createdAt}"></div>
            </div>
          </form>
          <i class="fa-solid fa-angle-right"></i>
          </div>`;
          })
          .join("");
        document.querySelector(".quiz-parent-box").innerHTML = EachQuiz;
        displayItem();
        copyText();
        updateItems();
        // disable all input
        disableInputs();
        // delete all quiz
        deleteQuiz();
      }

      // disable all input
      function disableInputs() {
        const AllInputs = document.querySelectorAll(
          ".quiz-parent-box .quiz-box input"
        );
        AllInputs.forEach((inputs) => {
          inputs.disabled = true;
        });
      }

      function displayItem() {
        const increaseHeight = document.querySelectorAll(
          ".quiz-parent-box .quiz-box .fa-angle-right"
        );
        // increase the height of the quiz box
        increaseHeight.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();

            // get the parent element
            const parentElementID = e.target.parentElement;
            parentElementID.classList.toggle("increaseHeight");
            btn.classList.toggle("spin_icon");
          });
        });
      }

      function copyText() {
        // Select all copy icons within .quiz-parent-box .quiz-box
        const copyIcons = document.querySelectorAll(
          ".quiz-parent-box .quiz-box #copy-icon"
        );

        copyIcons.forEach((icon) => {
          icon.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default action

            // Assuming there is an input field with id="link" related to each copy icon
            // You might need to adjust the selector based on your actual HTML structure
            const input = icon.closest(".quiz-box").querySelector("#link");
            if (input) {
              // Select the text
              input.focus();
              input.select();
              input.setSelectionRange(0, 99999); // For mobile devices

              // Copy the text to the clipboard
              navigator.clipboard
                .writeText(input.value)
                .then(() => {
                  console.log("Text copied successfully!");
                })
                .catch((err) => {
                  console.error("Failed to copy text: ", err);
                });
            } else {
              console.error("Input field not found");
            }
          });
        });
      }

      // updating the quiz items
      function updateItems() {
        const edit_icon = document.querySelectorAll(
          ".quiz-parent-box .quiz-box .fa-pen"
        );

        edit_icon.forEach((edit) => {
          edit.addEventListener("click", (e) => {
            e.preventDefault();

            document.querySelector("#update").style.display = 'block';

            const getDataAtt = e.target.dataset.id;
            console.log(getDataAtt);
            const parent_id =
              e.target.parentElement.parentElement.parentElement.dataset.id;

            const update_btn = document.querySelector("#update");
            const url = "http://localhost:4000/user/v1/updatequiz";

            if ("title" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  title: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    // const { success } = data;
                    console.log(success, data)
                    // if (success) {
                    //   // getPreviousElement.disabled = true;
                    //   document.querySelector("#update").style.display = 'none';
                    //   console.log(true)
                    // }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("description" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  description: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("question_length" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  total_number_of_question: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("duration" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  duration: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("score_per" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  score_mark_per_question: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("total_score" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  total_score_percentage: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("start_date" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              e.target.previousElementSibling.type = "date";
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                const data = {
                  quizID: parent_id,
                  start_date: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      getPreviousElement.type = "text";
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
            if ("end_date" === getDataAtt) {
              e.target.previousElementSibling.disabled = false;
              e.target.previousElementSibling.type = "date";
              update_btn.addEventListener("click", (e) => {
                e.preventDefault();

                const getPreviousElement = document.getElementById(getDataAtt);

                if (getPreviousElement.type === "text") {
                  getPreviousElement.type = "date";
                }

                const data = {
                  quizID: parent_id,
                  expired_date: getPreviousElement.value,
                };

                fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const { success } = data;
                    if (success) {
                      getPreviousElement.disabled = true;
                      getPreviousElement.type = "text";
                      document.querySelector("#update").style.display = 'none';
                    }
                  })
                  .catch((err) => console.log(err));
              });
            }
          });
        });
      }

      // delete the quiz datas
      function deleteQuiz() {
        // when the delete button is trigerred
        const delete_btn = document.querySelector("#delete");
        delete_btn.addEventListener("click", (e) => {
          e.preventDefault();

          const AllCheckersParent = document.querySelectorAll(
            ".quiz-parent-box .quiz-box .check_to_delete"
          );
          AllCheckersParent.forEach((parents) => {
            parents.style.display = "block";
          });
        });

        const AllCheckers = document.querySelectorAll(
          ".quiz-parent-box .quiz-box #checkers"
        );

        AllCheckers.forEach((check) => {
          check.disabled = false;
          check.addEventListener("change", (e) => {
            e.preventDefault();

            // parent element id
            const ParentelementId =
              e.target.parentElement.parentElement.dataset.id;

            const data = {
              quizID: ParentelementId,
            };

            const url = "http://localhost:4000/user/v1/deletequiz";

            delete_btn.addEventListener("click", (e) => {
              e.preventDefault();

              // Confirm deletion
              const confirmation = confirm(
                "Are you sure you want to delete the selected quizzes?"
              );
              if (!confirmation) {
                check.checked = false;
                return;
              }

              fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              })
                .then((res) => res.json())
                .then((message) => {
                  if (message.success) {
                    // Refresh quizzes after successful deletions
                    console.log(message);
                    return fetchQuizes();
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            });
          });
        });
      }
    }
  });
});

// analytics
const analytic = document.querySelector(".menu .analytic");

analytic.addEventListener("click", (e) => {
  e.preventDefault();

  display.style.display = "none";

  document.getElementById("analytic-section").style.display = "block";
});

// Prepare data
// const labels = ["January", "February", "March", "April", "May", "June", "July"];
// const data = {
//   labels: labels,
//   datasets: [
//     {
//       label: "My First Dataset",
//       data: [65, 59, 80, 81, 56, 55, 40],
//       backgroundColor: "rgba(255, 99, 132, 0.2)",
//       borderColor: "rgba(255, 99, 132, 1)",
//       borderWidth: 1,
//     },
//   ],
// };

// // Create chart configuration
// const config = {
//   type: "bar",
//   data: data,
//   options: {},
// };

// // Create chart instance
// const myChart = new Chart(document.getElementById("myChart"), config);

const url = "http://localhost:4000/user/v1/getuserprofile";

async function getProfile(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      let { Email, Username } = data;
      if (!Username) {
        Username = "Input a username";
      }
      // get the user profile {username and email}
      const html = `<div class="username">
          <label>Username</label>
          <input type="text" name="username" id="" disabled value="${Username}"/>
        </div>
        <div class="email">
          <label>Email</label>
          <input type="email" name="email" id="" disabled value="${Email}"/>
        </div>`;
      document.querySelector(".userProfile").innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
    });
}

getProfile(url);

const profile_pics = document.querySelector(".profile-pics .fa-pencil");
const avatarInput = document.querySelector(
  ".avatar_modal_update #updateAvatar"
);

// Display the avatar update modal when the profile_pics icon is clicked
const profilePics = document.querySelector(".profile-pics .fa-pencil");
profilePics.addEventListener("click", (e) => {
  e.preventDefault();
  const modalBox = document.querySelector(".avatar_modal_update");
  modalBox.style.display = "block";
});

// Handle the click event of the submit button
const submitBtn = document.querySelector(".avatar_modal_update button");
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Get the selected file
  const userAvatar = document.getElementById("updateAvatar").files[0];

  console.log(userAvatar);

  // Check if a file was selected
  if (!userAvatar) {
    console.log("Please select a file.");
    return;
  }

  const url = "http://localhost:4000/user/v1/updateuseravatar";

  // Create FormData object and append the selected file
  const formData = new FormData();
  formData.append("avatar", userAvatar);

  // Send POST request with FormData
  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((message) => {
      const { success } = message;
      if (success) {
        window.location.reload(); // Reload the page after successful update
      }
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});

// Handle the click event of the remove modal button
const removeModal = document.querySelector(".avatar_modal_update .fa-xmark");
removeModal.addEventListener("click", (e) => {
  e.preventDefault();
  const modalBox = document.querySelector(".avatar_modal_update");
  modalBox.style.display = "none";
});
