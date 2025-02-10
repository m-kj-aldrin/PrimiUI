document.addEventListener("change", (event) => {
    if (!(event instanceof CustomEvent)) return;

    try {
        const detail = event.detail;
        const favoriteThing = document.getElementById("favorite-thing");
        favoriteThing.textContent = detail.value;
    } catch (error) {
        console.error(error);
    }
});
