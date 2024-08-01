import {
  IStep,
  useChatInteract,
  useChatMessages,
} from "@chainlit/react-client";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { track, useEditor } from "tldraw";

type ContentType = { type: string; content: string };

const TldrawPrompt = track(() => {
  const editor = useEditor();
  const { messages } = useChatMessages();
  const { sendMessage, replyMessage, clear } = useChatInteract();

  const [value, setValue] = useState("Hi");
  const [content, setContent] = useState<ContentType[] | undefined>([]);

  const handleSendMessage = () => {
    sendMessage({
      name: "client",
      type: "user_message",
      output: "",
    });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        handleSendMessage();
        setValue("");
        break;
    }
  };

  useEffect(() => {
    console.log("change messages", messages, messages.length);
    const msgContent = messages
      .filter((msg) => msg.name === "Assistant")
      .map((msg) =>
        msg.output
          .replace(/\[(.*?)\]/g, "$1")
          .replace(`'type'`, `"type"`)
          .replace(`'text'`, `"text"`)
          .replace(`'content'`, `"content"`)
      )
      .map((msg) => JSON.parse(JSON.parse(JSON.stringify(msg))));

    setContent(msgContent);
  }, [messages]);

  useEffect(() => {
    if (content) {
      content.map((msg) => {
        editor.createShape({
          type: "geo",
          x: 0,
          y: 0,
          props: {
            text: msg.content,
            color: "blue",
            w: 400,
            h: 400,
            geo: "rectangle",
          },
        });
      });
    }
  }, [content]);

  return (
    <div className="absolute left-[3rem] top-[6rem] p-[2rem] bg-white">
      <p>Test Prompt</p>
      <input
        type="text"
        className="border-gray-4 border-solid border-[1px] bg-[white]"
        value={value}
        onChange={handleInput}
        onKeyUp={handleKeyUp}
      />
      <br />
      {messages
        .filter((msg) => msg.name === "Assistant")
        .map((msg) =>
          msg.output
            .replace(/\[(.*?)\]/g, "$1")
            .replace(`'type'`, `"type"`)
            .replace(`'text'`, `"text"`)
            .replace(`'content'`, `"content"`)
        )
        .map((msg, i) => {
          const { content } = JSON.parse(JSON.parse(JSON.stringify(msg)));
          if (content) {
            return <p key={msg + i}>{content}</p>;
          }
          return null;
        })}
    </div>
  );
});

export default TldrawPrompt;
