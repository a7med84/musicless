(function () {
    "use strict";

    const ar = {
        "lang": "ar",
        "dir": "rtl",
        "iconId": "iconAr",
        "dict": {

            "title": "بلا موسيقى",

            "slogan": "مزيل الموسيقى",
            
            "description": "يرجى تحديد ملف الفيديو أو الصوت المطلوب لإزالة الموسيقى منه.",
        
            "fileError": "الملف غير صالح",

            "fileTypeError": "يرجى اختيار فيديو او ملف صوني",

            "fileSizeError": "أقصى حجم للملف 100 ميغابايت",
        
            "submitBtn": "إزالة الموسيقى",
            
            "success": "تم إنشاء الملف: ",
        
            "download": "تنزيل",

            "error": "الخادم مشغول، يرجى المحاولة في وقت لاحق",

            "defaultError": "حدث خطأ ما، يرجى المحاولة في وقت لاحق",
                
            "loading": "يرجى انتظار اكتمال معالجة الملف",

            "rights": "حقوق النشر ©",

            "wt": " التقنية الموسعة ",

            "ksa": "، المملكة العربية السعودية",
                    
        }
    };
    
    const en = {
        "lang": "en",
        "dir": "ltr",
        "iconId": "iconEn",
        "dict": {
    
            "title": "MUSICLESS",

            "slogan": "MUSIC REMOVER",
            
            "description": "Please select the required video or audio file to remove music from it.",
        
            "fileError": "Invalid File",

            "fileTypeError": "The file must be audio or video",

            "fileSizeError": "Maximum allowed size: 100 MB",
        
            "submitBtn": "Remove Music",
            
            "success": "Your file is generated: ",
        
            "download": "Download",

            "error": "The server is busy, try again later",
            
            "defaultError": "Something went Worng, Please try again later",
                
            "loading": "Please wait while the file is processed",

            "rights": "Copyright ©",

            "wt": " Wide Technology ",

            "ksa": ", Kingdom of Saudi Arabia",
                    
        }
    };

    const lnagBtn = document.getElementById("langBtn");
    
    const toggleLang = () => {
        const idx = Math.abs(lnagBtn.dataset.lang - 1);
        const lang = [ar, en][idx];
        lnagBtn.dataset.lang = idx;
        translate(lang);
    }

    const translate = (lang) => {
        document.documentElement.setAttribute('dir', lang.dir);
        document.documentElement.setAttribute('lang', lang.lang);
        Array.from(lnagBtn.children).forEach((icon => icon.style.display = icon.id != lang.iconId ? "block" : "none"));
        lang = lang.dict;

        document.querySelectorAll('[localization-key]').forEach((element) => {
    
            let key = element.getAttribute('localization-key');
            if (key in lang) element.innerText =  lang[key];
        });
    
    };

    lnagBtn.addEventListener("click", toggleLang, false);
    translate([ar,en][lnagBtn.dataset.lang])

})();

