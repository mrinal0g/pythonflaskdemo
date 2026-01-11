from flask import Flask, request, jsonify
from config import app, db
from models import Contact
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Client directly
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error initializing Gemini Client: {e}")


@app.route("/contacts", methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})


@app.route("/create_contact", methods=["POST"])
def create_contact():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")

    if not first_name or not last_name or not email:
        return jsonify({"message": "You must include a first name, last name and email"}), 400

    new_contact = Contact(first_name=first_name, last_name=last_name, email=email)
    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)

    db.session.commit()

    return jsonify({"message": "User updated!"}), 200


@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "User deleted!"}), 200


# --- AI EMAIL DRAFTER ---
@app.route("/draft_email", methods=["POST"])
def draft_email():
    data = request.json
    
    recipient_name = data.get("firstName")
    subject_intent = data.get("subject")
    tone = data.get("tone")
    
    prompt = f"""
    You are an expert professional communication assistant.
    Task: Write a concise email draft.
    To: {recipient_name}
    Topic: {subject_intent}
    Tone: {tone}
    Constraints: Keep it under 150 words. No subject line in body.
    """
    
    try:
        # Direct call to gemini-2.5-flash
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        email_draft = response.text.strip()
        return jsonify({"draft": email_draft}), 200

    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"draft": f"Error connecting to AI: {str(e)}"}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)