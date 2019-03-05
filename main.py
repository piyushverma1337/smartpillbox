import os
import json
import datetime
from flask import Flask, request, render_template, flash, jsonify
from flask_socketio import SocketIO, join_room, emit, send
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
socketio = SocketIO(app)
webapp = []
device = []
answers = []
#doctors page - drug history(progress bar), patient response

@socketio.on('appconnected')
def handle_appconnect():
	print('[INFO]App connected')
	webapp.append(request.sid)


@socketio.on('deviceconnected')
def handle_deviceconnect():
	print('[INFO]Device connected')
	device.append(request.sid)
	socketio.emit('dvc', room=webapp[-1])


@app.route("/")
def home():
	return render_template("index.html")

@app.route("/doctor")
def doctor():
	return render_template("doctor.html")

@app.route("/feedback", methods=['POST'])
def feedback():
	answers.append(request.form['answers'])
	return jsonify({'status': 'OK'})

@app.route("/feedbackget", methods=['GET'])
def feedbackget():
	return jsonify({'answer': answers[-1]})

@socketio.on('status')
def status(state):
	socketio.emit('update', state, room=webapp[-1])


@socketio.on('buzz')
def on_buzz():
	print('buzz')
	socketio.emit('findme', room=device[-1])


@socketio.on('itstime')
def on_time():
	socketio.emit('pilltime', room=device[-1])
	# email
	day = datetime.datetime.now().strftime("%A")
	gmail_user = "smartpillbox1@gmail.com"
	gmail_password = "Atos@2018"
	msg = EmailMessage()
	msg.set_content(f"Its time to take your {day} pills.\n\nRegards\nPillbox")
	msg['Subject'] = "Please take your pills!"
	msg['From'] = "smartpillbox1@gmail.com"
	msg['To'] = "ganuganu@gmail.com"
	try:
		server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
		server.ehlo()
		server.login(gmail_user, gmail_password)
		server.send_message(msg)
		server.quit()
		server.close()
		print("Email sent!")
		socketio.emit('email', True, room=webapp[-1])
	except:
		print("Email failed!")
		socketio.emit('email', False, room=webapp[-1])


if __name__ == "__main__":
	if os.getenv("PORT"):
		socketio.run(app, host='0.0.0.0', port=int(os.getenv("PORT")), debug=False)
	else:
		socketio.run(app, host='0.0.0.0', debug=True)