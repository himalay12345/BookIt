!function(l){"use strict";l('#pricing_select input[name="rating_option"]').on("click",(function(){"price_free"==l(this).val()&&l("#custom_price_cont").hide(),"custom_price"==l(this).val()&&l("#custom_price_cont").show()})),l(".education-info").on("click",".trash",(function(){return l(this).closest(".education-cont").remove(),!1})),l(".add-education").on("click",(function(){return l(".education-info").append('<div class="row form-row education-cont"><div class="col-12 col-md-10 col-lg-11"><div class="row form-row"><div class="col-12 col-md-6 col-lg-4"><div class="form-group"><label>Degree</label><input type="text" name="degree" placeholder="Enter Degree" class="form-control"></div></div><div class="col-12 col-md-6 col-lg-4"><div class="form-group"><label>College/Institute</label><input type="text" name="college" placeholder="Enter College/Institute" class="form-control"></div></div><div class="col-12 col-md-6 col-lg-4"><div class="form-group"><label>Year of Completion</label><input type="text" name="yoc" placeholder="Enter Year of Completion" class="form-control"></div></div></div></div><div class="col-12 col-md-2 col-lg-1"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div></div>'),!1})),l(".experience-info").on("click",".trash",(function(){return l(this).closest(".experience-cont").remove(),!1})),l(".add-experience").on("click",(function(){return l(".experience-info").append('<div class="row form-row experience-cont"><div class="col-12 col-md-10 col-lg-11"><div class="row form-row"><div class="col-12 col-md-6 col-lg-4"><div class="form-group"><label>Institution Name</label><input type="text" name="institutionname" placeholder="Enter Institution Name" class="form-control"></div></div><div class="col-12 col-md-6 col-lg-2"><div class="form-group"><label>From</label><input type="text" placeholder="From" name="from" class="form-control"></div></div><div class="col-12 col-md-6 col-lg-2"><div class="form-group"><label>To</label><input type="text" placeholder="To" name="to" class="form-control"></div></div><div class="col-12 col-md-6 col-lg-4"><div class="form-group"><label>Designation</label><input type="text" placeholder="Designation" name="designation" class="form-control"></div></div></div></div><div class="col-12 col-md-2 col-lg-1"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div></div>'),!1})),l(".awards-info").on("click",".trash",(function(){return l(this).closest(".awards-cont").remove(),!1})),l(".add-award").on("click",(function(){return l(".awards-info").append('<div class="row form-row awards-cont"><div class="col-12 col-md-5"><div class="form-group"><label>Awards</label><input type="text" name="award" placeholder="Enter Awards" class="form-control"></div></div><div class="col-12 col-md-5"><div class="form-group"><label>Year</label><input type="text" name="year" placeholder="Enter Year" class="form-control"></div></div><div class="col-12 col-md-2"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div></div>'),!1})),l(".membership-info").on("click",".trash",(function(){return l(this).closest(".membership-cont").remove(),!1})),l(".add-membership").on("click",(function(){return l(".membership-info").append('<div class="row form-row membership-cont"><div class="col-12 col-md-10 col-lg-5"><div class="form-group"><label>Memberships</label><input type="text" class="form-control"></div></div><div class="col-12 col-md-2 col-lg-2"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div></div>'),!1})),l(".registrations-info").on("click",".trash",(function(){return l(this).closest(".reg-cont").remove(),!1})),l(".add-reg").on("click",(function(){return l(".registrations-info").append('<div class="row form-row reg-cont"><div class="col-12 col-md-5"><div class="form-group"><label>Registrations</label><input type="text" name="registration" placeholder="Enter Registration" class="form-control"></div></div><div class="col-12 col-md-5"><div class="form-group"><label>Year</label><input type="text" placeholder="Enter Year" name="regYear"class="form-control"></div></div><div class="col-12 col-md-2"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div></div>'),!1}))}(jQuery);