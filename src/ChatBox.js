import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";
import DOMPurify from "dompurify";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom

  // Function to handle the paste event, ensuring only plain text is pasted
  const handlePaste = (e) => {
    e.preventDefault(); // Prevent the default paste behavior
    const text = e.clipboardData.getData("text");
    document.execCommand("insertText", false, text);
  };

  // useEffect to add the paste event listener when the component mounts
  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("paste", handlePaste);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("paste", handlePaste);
      }
    };
  }, []);

  // useEffect to scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const typeMessage = (text, sender) => {
    let typedText = '';
    let index = 0;
    let messageKey = `ai-${Date.now()}`;

    const intervalId = setInterval(() => {
      if (index < text.length) {
        typedText += text.charAt(index);
        const newMessage = {
          id: messageKey,
          text: typedText,
          sender: sender,
        };
        setMessages(prevMessages => {
          const existingIndex = prevMessages.findIndex(msg => msg.id === messageKey);
          let newMessages = [...prevMessages];
          if (existingIndex >= 0) {
            newMessages[existingIndex] = newMessage;
          } else {
            newMessages.push(newMessage);
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 50); // Faster typing effect
  };

  const handleSend = async () => {
    const textContent = inputRef.current.innerText.trim();
    if (!textContent) return;

    const newUserMessage = {
      id: `user-${Date.now()}`,
      text: textContent,
      sender: "user",
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    inputRef.current.innerHTML = "";

    const sanitizedInput = DOMPurify.sanitize(textContent);
    console.log("Sending:", sanitizedInput);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitizedInput })
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Full response data:", JSON.stringify(responseData, null, 2));

        if (responseData && responseData.generated_text) {
          typeMessage(responseData.generated_text, "ai");
        } else {
          throw new Error("Unexpected response structure");
        }
      } else {
        throw new Error(`Failed to fetch with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      setMessages(prevMessages => [...prevMessages, {
        id: `error-${Date.now()}`,
        text: `Error: ${error.message}`,
        sender: "error",
      }]);
    }

    inputRef.current.innerHTML = "";
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

  return (
    <div className="chatbox">
      <ul className="messages-list">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={msg.sender === "user" ? "user-msg" : "ai-msg"}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}
        {/* This element is used to scroll to the bottom */}
        <div ref={messagesEndRef} />
      </ul>
      <div className="input-area">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <div
          ref={inputRef}
          contentEditable="true"
          className="editable-input"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
