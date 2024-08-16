import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";
import EmojiPicker from "emoji-picker-react";
import DOMPurify from "dompurify";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    const textContent = inputRef.current.innerText.trim();
    const hasImages = inputRef.current.querySelectorAll('img').length > 0;
    if (textContent || hasImages) {
      const sanitizedInput = DOMPurify.sanitize(inputRef.current.innerHTML);
      const newMessage = {
        id: messages.length + 1,
        text: sanitizedInput,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      inputRef.current.innerHTML = ""; // Clear the input field
    }
  };

  const onEmojiClick = (emojiObject) => {
    const img = document.createElement("img");
    img.src = emojiObject.imageUrl;
    img.alt = emojiObject.emoji;
    img.className = "emoji-img";
  
    // Append image to contentEditable div
    inputRef.current.appendChild(img);
  
    // Create and append a text node (space) after the emoji
    const textNode = document.createTextNode(" ");
    inputRef.current.appendChild(textNode);
  
    // Focus the contentEditable div and set the caret position right after the newly added text node
    inputRef.current.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStartAfter(textNode); // Setting the start after the text node
    range.setEndAfter(textNode); // Setting the end after the text node
    sel.removeAllRanges(); // Clear existing selections
    sel.addRange(range); // Apply the new range
  
    setShowEmojis(false);
  };
  

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newMessage = {
        id: messages.length + 1,
        text: `File: ${file.name}`,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojis(!showEmojis);
  };

  return (
    <div className="chatbox">
      <ul className="messages-list">
        {messages.map((msg) => (
          <li key={msg.id} className={msg.sender === "user" ? "user-msg" : "ai-msg"}
              dangerouslySetInnerHTML={{ __html: msg.text }} />
        ))}
      </ul>
      <div className="input-area">
        <button className="emoji-button" onClick={toggleEmojiPicker}>😊</button>
        <input type="file" ref={fileInputRef} onChange={handleFileInput} style={{ display: "none" }} />
        <button className="attachment-button" onClick={() => fileInputRef.current.click()}>
          <svg viewBox="0 0 24 24" width="20" height="24" fill="currentColor">
            <path d="M21.44,11.05l-9.19,9.19a6.56,6.56,0,0,1-9.19-9.19h0L12.25,1.29a4.59,4.59,0,0,1,6.48,6.48l-7.76,7.76a2.3,2.3,0,1,1-3.24-3.24L15.49,4.29a.77.77,0,0,1,1.09,1.09L8.82,13.14a.77.77,0,0,0,1.09,1.09l7.76-7.76a2.3,2.3,0,0,0-3.24-3.24L6.91,11.05a4.59,4.59,0,0,0,6.48,6.48l9.19-9.19Z"></path>
          </svg>
        </button>
        <div ref={inputRef} contentEditable="true" className="editable-input"
             onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
        />
        <button className="send-button" onClick={handleSend}>Send</button>
        {showEmojis && (
          <div ref={emojiPickerRef} style={{ position: "absolute", bottom: "100%", zIndex: 2 }}>
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
