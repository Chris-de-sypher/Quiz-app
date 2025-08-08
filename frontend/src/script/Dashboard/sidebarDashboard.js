const side_bar = document.querySelector(".side_bar");

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