!function(e){"function"==typeof define&&define.amd?define(["jquery","../jquery.validate"],e):"object"==typeof module&&module.exports?module.exports=e(require("jquery")):e(jQuery)}((function(e){return e.extend(e.validator.messages,{required:"Це поле необхідно заповнити.",remote:"Будь ласка, введіть правильне значення.",email:"Будь ласка, введіть коректну адресу електронної пошти.",url:"Будь ласка, введіть коректний URL.",date:"Будь ласка, введіть коректну дату.",dateISO:"Будь ласка, введіть коректну дату у форматі ISO.",number:"Будь ласка, введіть число.",digits:"Вводите потрібно лише цифри.",creditcard:"Будь ласка, введіть правильний номер кредитної карти.",equalTo:"Будь ласка, введіть таке ж значення ще раз.",extension:"Будь ласка, виберіть файл з правильним розширенням.",maxlength:e.validator.format("Будь ласка, введіть не більше {0} символів."),minlength:e.validator.format("Будь ласка, введіть не менше {0} символів."),rangelength:e.validator.format("Будь ласка, введіть значення довжиною від {0} до {1} символів."),range:e.validator.format("Будь ласка, введіть число від {0} до {1}."),max:e.validator.format("Будь ласка, введіть число, менше або рівно {0}."),min:e.validator.format("Будь ласка, введіть число, більше або рівно {0}.")}),e}));