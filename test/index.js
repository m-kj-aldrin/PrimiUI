document.addEventListener("change", (event) => {
    if (!(event instanceof CustomEvent)) return;
    const detail = event.detail;

    console.log(detail);
});
