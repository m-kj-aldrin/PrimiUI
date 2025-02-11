document.addEventListener("change", (event) => {
    console.log(`change event`, event.target);

    if (event?.detail) {
        const detail = event.detail;
        const favoriteThing = document.getElementById("favorite-thing");
        favoriteThing.textContent = detail.value;
    }
});

document.addEventListener("input", (event) => {
    console.log(`input event`, event.target);
    console.log(`input event.target.value`, event.target.value);
});
