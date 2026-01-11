import { useState, useEffect } from "react";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import API_URL from "./Config";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({});
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftingContact, setDraftingContact] = useState({});
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTone, setEmailTone] = useState("Professional");
  const [generatedDraft, setGeneratedDraft] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/contacts`);
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact({});
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    if (isModalOpen) return;
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const onUpdate = () => {
    closeModal();
    fetchContacts();
  };
  const openDraftModal = (contact) => {
    if (isModalOpen) return;
    setDraftingContact(contact);
    setGeneratedDraft(""); // Reset previous draft
    setEmailSubject(""); // Reset previous subject
    setIsDraftModalOpen(true);
  };

  const closeDraftModal = () => {
    setIsDraftModalOpen(false);
    setDraftingContact({});
  };

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/draft_email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: draftingContact.firstName,
          subject: emailSubject,
          tone: emailTone,
        }),
      });
      const data = await response.json();
      setGeneratedDraft(data.draft);
    } catch (error) {
      alert("Error generating draft: " + error);
    }
  };

  return (
    <>
      <ContactList
        contacts={contacts}
        updateContact={openEditModal}
        updateCallback={onUpdate}
        openDraftModal={openDraftModal}
      />
      <button onClick={openCreateModal}>Create New Contact</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <ContactForm
              existingContact={currentContact}
              updateCallback={onUpdate}
            />
          </div>
        </div>
      )}
      {isDraftModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeDraftModal}>
              &times;
            </span>
            <h2>Draft Email for {draftingContact.firstName}</h2>

            <form onSubmit={handleGenerateDraft}>
              <div>
                <label>Subject / Intent:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Follow up on project"
                  required
                />
              </div>
              <div>
                <label>Tone:</label>
                <select
                  value={emailTone}
                  onChange={(e) => setEmailTone(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: "10px" }}>
                Generate Draft
              </button>
            </form>

            {generatedDraft && (
              <div
                style={{
                  width: "100%",
                  marginTop: "20px",
                  background: "#ffffff",
                  padding: "0",
                  borderRadius: "5px",
                }}
              >
                <h3>AI Output:</h3>
                <textarea
                  readOnly
                  value={generatedDraft}
                  style={{
                    width: "100%",
                    height: "150px",
                    background: "#222",
                    color: "white",
                    border: "none",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
