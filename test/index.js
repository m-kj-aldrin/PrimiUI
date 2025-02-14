document.addEventListener("x-select", (event) => {
    const value = event.value;
    const name = event.name;
    console.log(`x-select event`, { value, name });

    const favoriteThing = document.getElementById("favorite-thing");
    favoriteThing.textContent = value;
});

document.addEventListener("input", (event) => {
    console.log(`input event`, event.target);
    console.log(`input event.target.value`, event.target.value);
});
