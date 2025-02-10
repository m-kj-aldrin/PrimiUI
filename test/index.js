document.addEventListener("change", (event) => {
    if (!(event instanceof CustomEvent)) return;
    try {
        const { value } = event.detail;
        let selectRoots = document.querySelectorAll("select-root");

        for (let selectRoot of selectRoots) {
            if (selectRoot == event.target) continue;
            selectRoot.setAttribute("value", value);
        }
    } catch (error) {
        console.error(error);
    }
});
