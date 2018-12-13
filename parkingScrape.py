from lxml import html
from flask import Flask
from flask_cors import CORS
from flask import request
import requests
import re
import json

app = Flask(__name__)
CORS(app)


@app.route("/", methods = ['GET'])
def parkingScrape():
	if request.method == 'GET':
		page = requests.get('https://payment.rpsa2.com/LocationAndRate/SpaceAvailability')
		tree = html.fromstring(page.content)
		lots = tree.xpath('//td/text()')
		locs = tree.xpath('//td/a/text()')
		parkingJson = {'garages': []}


		regex = re.compile(r'[\n\r\t]')
		for lot in lots:
			if  ' - ' in lot:
				lotinfo = {}
				lotinfo['name'] = lot.split(' - ')[0]
				lotinfo['availability'] = lot.split(' - ')[1].split('\n')[0]
				lotinfo['name'] = regex.sub('', lotinfo['name']).lstrip()
				lotinfo['availability'] = regex.sub('', lotinfo['availability']).lstrip()
				parkingJson['garages'].append(lotinfo)

		for i in range(len(locs)):
			parkingJson['garages'][i]['address'] = locs[i].lstrip()

		return json.dumps(parkingJson)
	return "heyo"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port='8080')
