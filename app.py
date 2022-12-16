from flask import Flask, render_template, redirect, jsonify, url_for, request, abort
from flask_cors import CORS, cross_origin
from brains import serve
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")

@app.route('/process', methods=['POST'])
def process_request():
    try:
        print("Procesando...")
        graph_dict = json.loads(request.get_json()['structure'])
        result_dict = serve(graph_dict)
        res_obj = result_dict


        """ ## Pruebas con json ##
        f = open('./static/json/structure.json', mode='w+')
        f.write(json.dumps(graph_dict))
        f.close()
        f = open('.static/json/processed_structure.json', mode='w+')
        f.write(json.dumps(result_dict))
        f.close() """


        
        return jsonify(res_obj), 201, {'Content-Type': 'application/json'}

    except:
        #return "400 Bad request error"
        abort(400)


@app.errorhandler(400)
def handle_bad_request(e):
    return 'bad request!', 400

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)

