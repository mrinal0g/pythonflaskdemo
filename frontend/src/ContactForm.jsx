import { useState, useEffect } from "react";
import API_URL from "./config";

const ContactForm = ({ existingContact = {}, updateCallback }) => {
  // Single state object for all form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // If updating, populate form with existing data
  useEffect(() => {
    if (existingContact.id) {
      setFormData({
        firstName: existingContact.firstName,
        lastName: existingContact.lastName,
        email: existingContact.email,
      });
    }
  }, [existingContact]);

  // Generic handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Determine if we are creating or updating
    const updating = Object.keys(existingContact).length !== 0;
    const url = updating
      ? `${API_URL}/update_contact/${existingContact.id}`
      : `${API_URL}/create_contact`;

    const options = {
      method: updating ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, options);
    if (response.status !== 201 && response.status !== 200) {
      const data = await response.json();
      alert(data.message);
    } else {
      // Refresh the list and close/reset form
      updateCallback();
      setFormData({ firstName: "", lastName: "", email: "" });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          name="firstName" // Matches state key
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          name="lastName" // Matches state key
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          name="email" // Matches state key
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <button type="submit">{existingContact.id ? "Update" : "Create"}</button>
    </form>
  );
};

export default ContactForm;
