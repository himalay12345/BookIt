!function(e){"function"==typeof define&&define.amd?define(["jquery","../jquery.validate"],e):"object"==typeof module&&module.exports?module.exports=e(require("jquery")):e(jQuery)}((function(e){return e.extend(e.validator.messages,{required:"Bu alanın doldurulması zorunludur.",remote:"Lütfen bu alanı düzeltin.",email:"Lütfen geçerli bir e-posta adresi giriniz.",url:"Lütfen geçerli bir web adresi (URL) giriniz.",date:"Lütfen geçerli bir tarih giriniz.",dateISO:"Lütfen geçerli bir tarih giriniz(ISO formatında)",number:"Lütfen geçerli bir sayı giriniz.",digits:"Lütfen sadece sayısal karakterler giriniz.",creditcard:"Lütfen geçerli bir kredi kartı giriniz.",equalTo:"Lütfen aynı değeri tekrar giriniz.",extension:"Lütfen geçerli uzantıya sahip bir değer giriniz.",maxlength:e.validator.format("Lütfen en fazla {0} karakter uzunluğunda bir değer giriniz."),minlength:e.validator.format("Lütfen en az {0} karakter uzunluğunda bir değer giriniz."),rangelength:e.validator.format("Lütfen en az {0} ve en fazla {1} uzunluğunda bir değer giriniz."),range:e.validator.format("Lütfen {0} ile {1} arasında bir değer giriniz."),max:e.validator.format("Lütfen {0} değerine eşit ya da daha küçük bir değer giriniz."),min:e.validator.format("Lütfen {0} değerine eşit ya da daha büyük bir değer giriniz."),require_from_group:"Lütfen bu alanların en az {0} tanesini doldurunuz."}),e}));