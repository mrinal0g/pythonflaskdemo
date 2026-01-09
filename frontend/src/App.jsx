import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // Fetching from the Flask backend URL
      const response = await fetch("http://127.0.0.1:5000/contacts");
      const data = await response.json();
      // Set the contacts state with the array received from backend
      setContacts(data.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  return (
    <>
      <h1>Contacts</h1>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.firstName}</td>
              <td>{contact.lastName}</td>
              <td>{contact.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
