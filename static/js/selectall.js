(function () {
    "use strict";

    const boxes = document.querySelectorAll('.sub');
    const all = document.getElementById('all');
    const namesInput = document.getElementById('names');
    const btn = document.getElementById('submitBtn');
    const form = document.querySelector('form');

    const update = (el) => {
        el.checked = all.checked;
    };

    const onchange = () => {
        boxes.forEach(update);
    };

    const onsubmit = () => {
        let x = '';
        boxes.forEach(box => {
            if (box.checked) x += box.id + ' ';
        });
        namesInput.value = x;
        form.submit();
    };

    all.addEventListener("change", onchange, false);

    btn.addEventListener('click', onsubmit, false);

})();
