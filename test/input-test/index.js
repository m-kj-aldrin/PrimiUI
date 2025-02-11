document.addEventListener("input", (event) => {
    const target = event.target;
    console.log(`input: ${target.name}: ${target.value}`);
});

document.addEventListener("change", (event) => {
    const target = event.target;
    console.log(`change: ${target.name}: ${target.value}`);
});
