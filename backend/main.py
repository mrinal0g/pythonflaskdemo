from config import db,app
from models import Contact
from flask import request,jsonify


@app.route("/contacts",methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x:x.to_json(),contacts))
    return({"contacts":json_contacts}),200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)