!function(e){"use strict";e.fn.extend({countdown100:function(t){t=e.extend({timeZone:"",endtimeYear:0,endtimeMonth:0,endtimeDate:0,endtimeHours:0,endtimeMinutes:0,endtimeSeconds:0},t);return this.each((function(){var n=e(this),a=new Date,i=t.timeZone;console.log(i);var o=t.endtimeYear,s=t.endtimeMonth,r=t.endtimeDate,d=t.endtimeHours,m=t.endtimeMinutes,u=t.endtimeSeconds;if(""==i)var c=new Date(o,s-1,r,d,m,u);else c=moment.tz([o,s-1,r,d,m,u],i).format();if(Date.parse(c)<Date.parse(a))c=new Date(Date.parse(new Date)+24*r*60*60*1e3+60*d*60*1e3);!function(t){var a=e(n).find(".days"),i=e(n).find(".hours"),o=e(n).find(".minutes"),s=e(n).find(".seconds");function r(){var e=function(e){var t=Date.parse(e)-Date.parse(new Date),n=Math.floor(t/1e3%60),a=Math.floor(t/1e3/60%60),i=Math.floor(t/36e5%24),o=Math.floor(t/864e5);return{total:t,days:o,hours:i,minutes:a,seconds:n}}(t);a.html(e.days),i.html(("0"+e.hours).slice(-2)),o.html(("0"+e.minutes).slice(-2)),s.html(("0"+e.seconds).slice(-2)),e.total<=0&&clearInterval(d)}r();var d=setInterval(r,1e3)}(c)}))}})}(jQuery);