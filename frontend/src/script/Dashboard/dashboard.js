/** @format */


// call the socket client
const socket = io();

socket.on('connect', (res) => {
  console.log('user logged in');
})


let quizes = [];


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


      // change password
      const change_password = document.querySelector("#change_password");

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

        const url = "/api/v1/data/changepassword";

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

      // update when deleted in real time
      socket.on('updateQuiz', (quizList) => {
        displayquiz(quizList);
      })

      // // get the quizzes of the user
      // function fetchQuizes() {
      fetch("/api/v1/data/getuserquiz")
        .then((res) => res.json())
        .then((data) => {
          const { quiz } = data;
          console.log(quiz);
          console.log(typeof quiz);
          console.log(quiz.length);

          if (quiz.length === 0) {
            console.log("no data");
          }

          displayquiz(quiz);
        })
        .catch((err) => console.log(err));
      // }

      // fetchQuizes();


      function displayquiz(data) {
        const EachQuiz = data
          .map((item) => {
            // Example start and end date strings retrieved from the database
            const startDateString = item.start_date;
            const endDateString = item.expired_date;

            // Parse the start and end date strings into Date objects
            const startDate = new Date(startDateString);
            const endDate = new Date(endDateString);

            // Check if the start date is before, after, or equal to the end date
            if (startDate < endDate) {
              console.log("Start date is before end date");
            } else if (startDate > endDate) {
              console.log("Start date is after end date");
            } else {
              console.log("Start date is equal to end date");
            }

            // Calculate the duration between the start and end dates in days
            const durationMilliseconds = endDate - startDate;
            const durationDays = Math.floor(durationMilliseconds / (1000 * 60 * 60 * 24));

            console.log(`Duration: ${durationDays} days left`);

            // Function to format a date as yyyy-mm-dd
            const formatDate = (date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            };

            // Format the start and end dates
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            console.log("Formatted Start Date:", formattedStartDate);
            console.log("Formatted End Date:", formattedEndDate);

            return `<div class="quiz-box" data-id="${item._id}">
            <div class="check_to_delete"><input type="checkbox" id="checkers"/></div>
            <div class="updateanddelete">
              <span class="fa-solid fa-pen" data-id="edit"></span>
              <span class="fa-solid fa-trash" id="delete_single"></span>
            </div>
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
            </div>
            
            <div class="question_le">
              <label for="question_length">Total number of questions</label>
              <input
                type="number"
                name="total_number_of_question"
                id="question_length"
                placeholder="Question length"
                class="data"
                value="${item.total_number_of_question}"
              />
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
            </div>
            
            <div class="score_per_question">
              <label for="score_per_question">Score per question</label>
              <input
                type="number"
                name="score_mark_per_question"
                id="score_per"
                placeholder="score per question"
                class="data"
                value="${item.score_mark_per_question}"
              />
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
            </div>
            
            <div class="start_date">
              <label for="start_date">Start Date</label>
              <input
                type="text"
                name="start_date"
                id="start_date"
                placeholder="start_date"
                class="data"
                value="${formattedStartDate}"
              />
            </div>
            
            <div class="end_date">
              <label for="end_date">End Date</label>
              <input
                type="text"
                name="expired_date"
                id="end_date"
                placeholder="end_date"
                class="data"
                value="${formattedEndDate}"
              />
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

      // Updating the quiz items
      function updateItems() {
        const editIcons = document.querySelectorAll(".quiz-parent-box .quiz-box .fa-pen");
        const updateBtn = document.querySelector("#update");
        const url = "/api/v1/data/updatequiz";

        editIcons.forEach((edit) => {
          edit.addEventListener("click", (e) => {
            e.preventDefault();

            // Show the update button
            updateBtn.style.display = "block";

            // Get the parent quiz ID
            const parentID = e.target.closest(".quiz-box").dataset.id;

            // Enable all input fields inside the quiz box
            const inputs = e.target.closest(".quiz-box").querySelectorAll("input, textarea");
            inputs.forEach((input) => {
              input.disabled = false;
              console.log(input.value)


              // Handle date fields properly
              if (input.dataset.id === "start_date" || input.dataset.id === "end_date") {
                input.type = "date";
              }
            });

            // Update the quiz on button click
            updateBtn.addEventListener("click", async (e) => {
              e.preventDefault();

              // Create an object to store updated fields
              let updateData = { quizID: parentID };

              // Collect only modified fields
              inputs.forEach((input) => {
                if (input.value.trim() !== "") {
                  updateData[input.name] = input.value;
                }
              });

              try {
                let response = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updateData),
                });

                let result = await response.json();
                console.log(result);

                if (result.success) {
                  // Disable inputs after update
                  inputs.forEach((input) => {
                    input.disabled = true;
                    if (input.type === "date") input.type = "text";
                  });

                  // Hide the update button again
                  updateBtn.style.display = "none";
                }
              } catch (err) {
                console.log("Error updating quiz:", err);
              }
            });
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


          const AllCheckers = document.querySelectorAll(
            ".quiz-parent-box .quiz-box #checkers"
          );

          AllCheckers.forEach((check) => {
            check.checked = true;

            // fetch the quiz into the preview box
            const fetchQuiz = "/api/v1/data/getuserquiz";

            function findQuizes() {
              fetch(fetchQuiz)
                .then((res) => res.json())
                .then((data) => {
                  const { quiz } = data;
                  previewQuize(quiz);
                })
                .catch((err) => console.log(err));
            }


            function previewQuize(quiz) {
              // clear the container
              document.querySelector(".vertical-height").innerHTML = '';
              // display the preview container
              document.querySelector('.overlay_delete_preview').style.display = 'flex';
              const quizzes = quiz.map(data => {
                return `<div class="quiz-box" data-id="${data._id}">
                <p>Title: <span class="title">${data.title}</span></p>
                <p>Description: <span class="Description">${data.description}</span></p>
                <p>
                  total number of question:
                  <span class="total_number_of_question">${data.total_number_of_question}</span>
                </p>
                <p>Duration: <span class="Duration">${data.duration}</span></p>
                <p>
                  Score per question: <span class="score_per_question">${data.score_mark_per_question}</span>
                </p>
                <p>Percentage score: <span class="Percentage_score">${data.total_score_percentage}</span></p>
                <p>Quiz Link: <span class="quiz_link">${data.generate_unique_link}</span></p>
              </div>`
              })
                .join("")
              document.querySelector(".vertical-height").innerHTML = quizzes;
            }
            findQuizes();

            // fontawesome icon to remove preview
            const cancel_button = document.querySelector('.delete_text .fa-xmark');
            // function is called before written and also passes the icon as an argument
            remove_preview(cancel_button)
            function remove_preview(cancel) {
              cancel.onclick = () => {
                // remove the preview
                document.querySelector('.overlay_delete_preview').style.display = 'none';
                document.querySelector('.overlay_delete_preview').style.transition = '.4s ease-in';
                // hide the checkboxes
                AllCheckersParent.forEach((parents) => {
                  parents.style.display = "none";
                });
              }
            }
          });

          // lets get the id of the quiz 
          const container = document.querySelector('.vertical-height');
          const delete_doc = document.querySelector('#confirmation_del_btn');
          get_ids(delete_doc)
          function get_ids(del) {
            del.onclick = (e) => {
              e.preventDefault();

              const allquizzes = container.querySelectorAll('.quiz-box')
              allquizzes.forEach(quiz => {
                // get the ids
                let IDS = quiz.getAttribute('data-id');
                const deleteurl = "/api/v1/data/deletequiz";

                // call the confirmation page for the delete preview
                document.querySelector('.confrimation_box_overlay').style.display = 'flex';

                // remove the preview page
                document.querySelector('.overlay_delete_preview').style.display = 'none';

                // activate the confirmation delete button to delete the quiz or cancel 
                const delete_quiz = document.querySelector('#delete_doc_btn');
                const cancel_ = document.querySelector('#cancel_');

                // remove the confirmation page
                cancel_.onclick = (e) => {
                  e.preventDefault();
                  // remove the confirmation page
                  document.querySelector('.confrimation_box_overlay').style.display = 'none';
                }

                // use the event listener // delete multiple quiz
                delete_quiz.addEventListener('click', (e) => {
                  e.preventDefault();


                  // // let fetch 
                  fetch(deleteurl, {
                    method: "DELETE",
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ IDS })
                  })
                    .then(res => {
                      if (!res.ok) throw new Error('Failed to delete the quiz')
                      res.json()
                      // remove the confirmation page 
                      document.querySelector('.confrimation_box_overlay').style.display = 'none';

                    })
                    .then(data => {
                      console.log(data)
                      document.querySelector('.quiz-parent-box').innerHTML = '';
                    })
                    .catch(err => console.error(err))
                })
              })
            }

          }
        });


      }

      // delete individual quiz
      const quiz_containers = document.querySelector('.quiz-parent-box');
      console.log(quiz_containers);


      // delete single quiz - a quiz 
      quiz_containers.addEventListener(
        'click', deleteSinglequiz
      )
      function deleteSinglequiz(e) {
        const deleteIcon = e.target.id === 'delete_single';
        if (deleteIcon) {

          const allQuizes = quiz_containers.querySelectorAll('.quiz-box');
          for (let i = 0; i < allQuizes.length; i++) {
            const quiz = allQuizes[i];
            const ID = quiz.getAttribute('data-id');

            // Check if this is the clicked quiz
            if (quiz.contains(e.target)) {
              console.log('Deleting quiz with ID:', ID);

              // Remove from DOM
              quiz.remove();

              const url = `/api/v1/data//deletequiz/${ID}`;

              fetch(url, {
                method: 'DELETE',
              })
                .then(res => res.json())
                .then(data => console.log(data.success))
                .catch(err => console.log(err))

              break; // stop loop once deleted
            }
          }
        }
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
// const labels = ["Quiz created", "user participated", "Questions answered"];
// const data = {
//   labels: labels,
//   datasets: [
//     {
//       label: "Quiz data report",
//       data: [65, 59, 80],
//       backgroundColor: "rgba(105, 89, 230, 0.2)",
//       borderColor: "rgba(255, 249, 252, 1)",
//       borderWidth: 1,
//     },
//   ],
// };

// Create chart configuration
// const config = {
//   type: "bar",
//   data: data,
//   options: {},
// };

// create a function
function datareport() {
  const url = '/api/v1/data/userreportchart';

  fetch(url).then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err))
}
datareport()
// Create chart instance
// const myChart = new Chart(document.getElementById("myChart"), config);

const url = "/api/v1/data/getuserprofile";

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

  const url = "/api/v1/data/updateuseravatar";

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


