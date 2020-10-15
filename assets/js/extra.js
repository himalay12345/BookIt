
function smshowSeats(i)
{
var seats = document.querySelectorAll('#smseats');

console.log(i);
// seats[i].classList.remove('displayNone');
seats[i].classList.toggle('displayFlex');

}
function showSeats(i)
{
var seats = document.querySelectorAll('#seats');

console.log(i);
seats[i].classList.toggle('displayFlex');

}

function smprevSlide()
{
var c= $('#smnextslide').data('count');

if(c<=1)
{
    $('#smprevslide').css('display','none');
    return;
}
var today = new Date();
today.setDate(today.getDate() + c-2);
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var dayOfWeek = weekday[today.getDay()];
var daten = dd+'-'+mm+'-'+yyyy;

console.log(daten);
var d = c-1;
console.log(d);
if(d<=29)
{
    $('#smnextslide').css('display','block');
}

let n1 = c;
if(n1 > 7)
{
    n1=n1%7;
    if(n1==0)
    {
        n1=7;
    }
}
let p1 = n1-1;
if(p1<=0)
{
    p1=7;
}


let d4 = $('#smd'+n1);
let d1 = $('#smd'+p1);
$(`#smd${p1} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',daten);
});
console.log(n1,p1)
d4.removeClass('displayBlock');
d4.addClass('displayNone');

d1.removeClass('displayNone');
d1.addClass('displayBlock');


var next = document.querySelector('#smli'+c);
var prev =  document.querySelector('#smli'+d);


    next.classList.add('displayNone');


    prev.classList.remove('displayNone');
    prev.classList.add('displayBlock');

// $('#prevslide').data('count',d); 
$('#smnextslide').data('count',d); 

}

function smnextSlide()
{
let c= $('#smnextslide').data('count');
console.log(c)

var today = new Date();
today.setDate(today.getDate() + c);
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var dayOfWeek = weekday[today.getDay()];
var daten = dd+'-'+mm+'-'+yyyy;

console.log(daten);



if(c>=30){
    $('#smnextslide').css('display','none');
    return;
}
if(c>=1)
{
    $('#smprevslide').css('display','block');
}
let n1 = c+1;
if(n1 > 7)
{
    n1=n1%7;
    if(n1==0)
    {
        n1=7;
    }
}
let p1 = n1-1;
if(p1<=0)
{
    p1=7;
}
let d1 = $('#smd'+n1);
$(`#smd${n1} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',daten);
});
let d4 = $('#smd'+p1);
console.log(n1,p1)
d4.removeClass('displayBlock');
d4.addClass('displayNone');
d1.removeClass('displayNone');
d1.addClass('displayBlock');
let d = c+1;
let next = document.querySelector('#smli'+d);
let prev =  document.querySelector('#smli'+c);


    prev.classList.add('displayNone');
    next.classList.remove('displayNone');
    next.classList.add('displayBlock');
$('#smnextslide').data('count',d); 

}

function nextSlide()
{
let c= $('#nextslide').data('count');
console.log(c);
var datec = c*3 + 3;
var date1,date2,date3;
var today = new Date();
today.setDate(today.getDate() + datec);
for(var i=1;i<=3;i++)
{
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var dayOfWeek = weekday[today.getDay()];
if(i==1)
{
    date1 = dd+'-'+mm+'-'+yyyy;
}

if(i==2)
{
    date2 = dd+'-'+mm+'-'+yyyy;
}

if(i==3)
{
    date3 = dd+'-'+mm+'-'+yyyy;
}

var res = today.setTime(today.getTime() + (1 * 24 * 60 * 60 * 1000));
var date = new Date(res);
today=date;
}

console.log(date1,date2,date3);
if(c>=8){
    $('#nextslide').css('display','none');
    return;
}
if(c>=0)
{
    $('#prevslide').css('display','block');
}


let n1 = (c*3)+3+1;
if(n1 > 7)
{
    n1=n1%7;
    if(n1==0)
    {
        n1=7;
    }
}
let n2 = n1+1;
if(n2 > 7)
{
    n2=n2%7;
    if(n2==0)
    {
        n2=7;
    }
}
let n3 = n2+1;
if(n3 > 7)
{
    n3=n3%7;
    if(n3==0)
    {
        n3=7;
    }
}
let p1 = n1-1;
if(p1<=0)
{
    p1=7;
}
let p2 = p1-1;
if(p2<=0)
{
    p2=7;
}
let p3 = p2-1;
if(p3<=0)
{
    p3=7;
}


let d1 = $('#d'+n1);
let d2 = $('#d'+n2);
let d3 = $('#d'+n3);
$(`#d${n1} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date1);
});
$(`#d${n2} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date2);
});
$(`#d${n3} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date3);
});
let d4 = $('#d'+p1);
let d5 = $('#d'+p2);
let d6 = $('#d'+p3);
console.log(n1,n2,n3,p1,p2,p3)
d4.removeClass('displayBlock');
d4.addClass('displayNone');
d5.removeClass('displayBlock');
d5.addClass('displayNone');
d6.removeClass('displayBlock');
d6.addClass('displayNone');
d1.removeClass('displayNone');
$('.clearfix li:nth-child('+n1+')').css("order", '1');
d1.addClass('displayBlock');
d2.removeClass('displayNone');
$('.clearfix li:nth-child('+n2+')').css("order", '2');
d2.addClass('displayBlock');
d3.removeClass('displayNone');
$('.clearfix li:nth-child('+n3+')').css("order", '3');
d3.addClass('displayBlock');



console.log(c);


let d = c+1;
let next = document.querySelectorAll('#li'+d);
let prev =  document.querySelectorAll('#li'+c);

for(temp of prev)
{
    temp.classList.add('displayNone');
}
for(temp1 of next)
{
    temp1.classList.remove('displayNone');
    temp1.classList.add('displayBlock');
}
$('#nextslide').data('count',c+1); 

}
function prevSlide()
{
var c= $('#nextslide').data('count');
var datec = (c-2)*3+3;
var date1,date2,date3;
var today = new Date();
today.setDate(today.getDate() + datec);
for(var i=1;i<=3;i++)
{
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var dayOfWeek = weekday[today.getDay()];
if(i==1)
{
    date1 = dd+'-'+mm+'-'+yyyy;
}

if(i==2)
{
    date2 = dd+'-'+mm+'-'+yyyy;
}

if(i==3)
{
    date3 = dd+'-'+mm+'-'+yyyy;
}

var res = today.setTime(today.getTime() + (1 * 24 * 60 * 60 * 1000));
var date = new Date(res);
today=date;
}

console.log(date1,date2,date3);

if(c<=0)
{
    $('#prevslide').css('display','none');
    return;
}
var d = c-1;
console.log(d);
if(d<=8)
{
    $('#nextslide').css('display','block');
}

let n1 = (d*3)+3+1;
if(n1 > 7)
{
    n1=n1%7;
    if(n1==0)
    {
        n1=7;
    }
}
let n2 = n1+1;
if(n2 > 7)
{
    n2=n2%7;
    if(n2==0)
    {
        n2=7;
    }
}
let n3 = n2+1;
if(n3 > 7)
{
    n3=n3%7;
    if(n3==0)
    {
        n3=7;
    }
}
let p1 = n1-1;
if(p1<=0)
{
    p1=7;
}
let p2 = p1-1;
if(p2<=0)
{
    p2=7;
}
let p3 = p2-1;
if(p3<=0)
{
    p3=7;
}


let d4 = $('#d'+n1);
let d5 = $('#d'+n2);
let d6 = $('#d'+n3);
let d1 = $('#d'+p1);
let d2 = $('#d'+p2);
let d3 = $('#d'+p3);
$(`#d${p3} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date1);
});
$(`#d${p2} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date2);
});
$(`#d${p1} a#checkme`).each(function(i, obj) {
    obj.setAttribute('data-date',date3);
});
console.log(n1,n2,n3,p1,p2,p3)
d4.removeClass('displayBlock');
d4.addClass('displayNone');
d5.removeClass('displayBlock');
d5.addClass('displayNone');
d6.removeClass('displayBlock');
d6.addClass('displayNone');
d1.removeClass('displayNone');
$('.clearfix li:nth-child('+p1+')').css("order", '3');
d1.addClass('displayBlock');
d2.removeClass('displayNone');
$('.clearfix li:nth-child('+p2+')').css("order", '2');
d2.addClass('displayBlock');
d3.removeClass('displayNone');
$('.clearfix li:nth-child('+p3+')').css("order", '1');
d3.addClass('displayBlock');




// var c= $('#prevslide').data('count');

var next = document.querySelectorAll('#li'+c);
var prev =  document.querySelectorAll('#li'+d);
for(temp of next)
{
    temp.classList.add('displayNone');
}
for(temp1 of prev)
{
    temp1.classList.remove('displayNone');
    temp1.classList.add('displayBlock');
}
// $('#prevslide').data('count',d); 
$('#nextslide').data('count',d); 

}


var timing = document.querySelectorAll('#checkme');
console.log(timing)

for(let i=0;i<timing.length;i++){
    timing[i].addEventListener('click',function()
    {
        for(let i=0;i<timing.length;i++){
            timing[i].classList.remove('selected');
            var a = $('#inputid');
            for( b of a)
            {
                b.remove();
            }
        }
        
        timing[i].classList.toggle('selected');
       var data1 =  timing[i].getAttribute('data-id');
       var data2 =  timing[i].getAttribute('data-booked');
       var data3 =  timing[i].getAttribute('data-available');
       var data4 =  timing[i].getAttribute('data-slot-index');
       var data5 =  timing[i].getAttribute('data-day-index');
       var data6 = timing[i].getAttribute('data-date');


        var dummy = '<input type="hidden" name="id" value="'+data1+'"id="inputid"><input type="hidden" name="booked" value="'+data2+'" id="inputid"><input type="hidden" name="available" value="'+data3+'" id="inputid"><input type="hidden" name="slotindex" value="'+data4+'" id="inputid"><input type="hidden" name="dayindex" value="'+data5+'" id="inputid"><input type="hidden" name="date" value="'+data6+'" id="inputid">';
        timing[i].innerHTML += dummy;

         $('#submit_btn').prop("disabled", false);  
    })
}
