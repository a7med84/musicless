(function () {
    "use strict";

    const input = document.getElementById("fileinput");
    const btn = document.getElementById("submitbtn");
    const feedback = document.getElementById("invalidFeedback");
    const loadingModal = document.getElementById("loadingModal");
    const loader = document.getElementById("loading");
    const successAlert = document.getElementById("successAlert");
    const errorAlert = document.getElementById("errorAlert");
    const fileLink = document.getElementById("fileLink");
    
    function defaultErrorMsg(){
        let msg = document.documentElement.lang == "ar" ? "حدث خطأ ما، يرجى المحاولة في وقت لاحق" : "Something went Worng, Please try again later";
        errorAlert.setAttribute("localization-key", "defaultError");
        return msg;
    }

    const upload = (file) => {
        hideResult();
        loadingDisplay(true);
        const formData = new FormData();
        formData.append("file", file);
        fetch("/remove-music/", {
            method: "POST",
            body: formData
        }).then(response => {
            console.log('response');
            return response.json();
            }
        ).then(data => {
            console.log("response recived");
            console.log(data);
            let result = ""
            if (data.detail) {
                console.log("internal error");
                console.log(data.detail);
    
                loadingDisplay(false);
                let err = data.detail;
                if (err == "The server is busy, try again later"){
                    err = document.documentElement.lang == "ar" ? "الخادم مشغول، يرجى المحاولة في وقت لاحق" : "The server is busy, try again later" 
                    errorAlert.setAttribute("localization-key", "error")
                }else errorAlert.setAttribute("localization-key", "Unknown");
                    showError(err);
            } else if (data.file_url) {
                console.log("success");
                console.log(data.file_url);
    
                loadingDisplay(false);
                showSuccess(data.file_url);
            }
        }).catch(err => {
            console.log("error occured");
            console.error(err);
            loadingDisplay(false);
            showError(defaultErrorMsg());
        })
    };
    
    
    function loadingDisplay(show) {
        if (show) {
            loadingModal.style.display = "block"
            loader.classList.add("display");
        } else {
            loadingModal.style.display = "none"
            loader.classList.remove("display");
        }
    }
    
    function showSuccess(file_href) {
        hideError()
        fileLink.setAttribute("href", file_href);
        successAlert.classList.remove("d-none");
    }
    
    function showError(msg) {
        hideSuccess();
        errorAlert.innerText = msg;
        errorAlert.classList.remove("d-none");
    }
    
    function hideSuccess() {
        successAlert.classList.add("d-none");
        fileLink.setAttribute("href", "#");
    }
    
    function hideError() {
        errorAlert.classList.add("d-none");
        errorAlert.innerText = defaultErrorMsg();
    }
    
    function hideResult() {
        hideSuccess();
        hideError();
    }
    
    const onClick = () => upload(input.files[0]);
    btn.addEventListener("click", onClick, false);


    input.addEventListener("change", function (event) {
        // When the control has changed, there are new files
        if (!input.files) {
            btn.disabled = true;
            input.classList.remove("is-invalid");
            return;
        }

        const file = input.files[0]
        let isValid = file ? ((file.type.includes("audio") || file.type.includes("video"))) : false;
        if (!isValid) {
            btn.disabled = true;
            if (file) {
                input.classList.add("is-invalid");
                feedback.textContent = document.documentElement.lang == "ar" ? "يرجى اختيار فيديو او ملف صوني" : "The file must be audio or video";
                feedback.setAttribute("localization-key", "fileTypeError");
            }
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            btn.disabled = true;
            input.classList.add("is-invalid");
            feedback.textContent = document.documentElement.lang == "ar" ? "أقصى حجم للملف 100 ميغابايت" : "Maximum allowed size: 100 MB";
            feedback.setAttribute("localization-key", "fileSizeError");
            return;
        }
        btn.removeAttribute("disabled");
        input.classList.remove("is-invalid");
        
    }, false);

})();
