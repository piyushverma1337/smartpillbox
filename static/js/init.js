days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//states -> taken, due, available, alert; done_all, flash_on, done, error;
var demo = false;

//countdown
var countDownDate = new Date("Mar 29, 2019 20:30:00").getTime();
var x = setInterval(function () {
	var now = new Date().getTime();
	var distance = countDownDate - now;
	var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	//document.getElementById("nextVisit").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
	if (!demo) {
		$("#nextPill").html(hours + "h " + minutes + "m " + seconds + "s ");
		if (distance < 0) {
			clearInterval(x);
			$("#nextPill").html("EXPIRED");
		}
	}
}, 1000);
//



//websock
var ws = new WebSocket("ws://192.168.0.108/ws");
// verify our websocket connection is established
ws.onopen = function () {
	console.log('Websocket connected!');
};

let msgOld = [];
ws.onmessage = function (msg) {
	console.log(msg);
	msg = msg.data.split('');
  $("#pillsContainer").empty();

  var styleMap = {
    '0': { color: 'green', status: 'done_all' },
    '1': { color: 'yellow pulse', status: 'flash_on' },
    '2': { color: 'grey', status: 'event' }
  }
	msg.forEach((i, inx) => {
    let str = `<div class="pill col s3">`;
    if (i !== '0') {
      if (!msgOld[inx]) {
        str += `<div class="pill-image delayed-animation" data-av-animation="bounceIn"></div>`;
      } else {
        str += `<div class="pill-image" data-av-animation="noAnimation"></div>`;
      }
    } else {
      if (msgOld[inx] && msgOld[inx] !== i) {
        str += `<div class="pill-image bounceOut animated" data-av-animation="bounceOut"></div>`
      }
    }
    str += `<a class="pill-indicator btn-floating ${styleMap[i].color}"><i class="material-icons">${styleMap[i].status}</i></a>
            </div>
           `
    $("#pillsContainer").append(str);
    msgOld[inx] = i;
  });
  $('.pill-image').AniView();
};


$("#findDevice").click(function () {
	ws.send('findme');
});
//

//demo
$("#nextPill").click(function () {
	$(this).html("0h 0m 0s");
	demo = !demo;
	if (demo) {
		ws.send('pilltime');
	}
});
//

//notifications
var elem = document.querySelector('.tap-target');
M.TapTarget.init(elem);
var instance;
$("#alert").click(function () {
	instance = M.TapTarget.getInstance(elem);
	instance.open();
});
//

var q1 = '<div class="row"><form class="col s12"><div id="questionDiv" class="row"><div class="input-field col s12"><input id="q" type="text" class="validate"><label for="q">How are you feeling?</label></div></div></form></div>';
var q2 = '<div class="row"><form class="col s12"><div id="questionDiv" class="row"><div class="input-field col s12"><input id="q" type="text" class="validate"><label for="q">Do you feel any nausea?</label></div></div></form></div>';
var q3 = '<div class="row"><form class="col s12"><div id="questionDiv" class="row"><div class="input-field col s12"><input id="q" type="text" class="validate"><label for="q">Have you had any headaches post medicine?</label></div></div></form></div>';
var q4 = '<div class="row"><h5>Thanks!</h5></div>';
var qarr = [];
qarr.push(q1);
qarr.push(q2);
qarr.push(q3);
qarr.push(q4);

var i = 0;
var answers = [];

$("#feedbackBtn").click(function () {
	if ($("#q").val()) {
		answers.push($("#q").val());
	}
	$("#feedbackDiv").empty();
	if (i == 3) {
		$("#feedbackDiv").append(qarr[i]);
		$("#feedbackBtn").hide();
		setTimeout(function () {
			instance.close();
			$("#alert").hide();
		}, 1500);
		console.log(answers);
		$.ajax({
			type: "POST",
			url: "/feedback",
			data: {
				"answers": JSON.stringify(answers)
			},
			success: function (response) {
				console.log("OK");
			},
			error: function (error) {
				console.log(error);
			}
		});
	} else {
		$("#feedbackBtn").text('Next');
		$("#feedbackDiv").append(qarr[i]);
		i = i + 1;
	}
});

$("#errorMonth").click(function () {
	$("#progressMessage").empty();
	$("#progressMessage").append('<i class="material-icons">error</i> Month 3, Medcine was missed for 3 days. August 15th, August 16th, August 17th');
});

$("#goodMonth").click(function () {
	$("#progressMessage").empty();
	$("#progressMessage").append('<i class="material-icons">star</i> Month 5 of treatment, Good progress!');
});


var animationOptions = {
  animateThreshold: 200,
  scrollPollInterval: 20
}
$('.pills-container-image').AniView();