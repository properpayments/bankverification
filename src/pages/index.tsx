import { useState } from "react";
import { parseFile } from "~utils/parseCSV";
import { Message, MessageCode, PapaParseResult } from "~types";

type ValidationStatusType =
  | "idle"
  | "validating"
  | "success"
  | "error"
  | "error-500";

const getMessageDescription = (code: MessageCode) => {
  if (code === "missing-virtual-account") {
    return "The sender is not a virtual bank account";
  } else if (code === "account-not-in-approved-list") {
    return "Destination is not in list of approved accounts";
  } else if (code === "fee-wrong-account") {
    return "Expected destination to be operations account";
  } else if (code === "fee-currency-mismatch") {
    return "Expected destination to be operations account with matching currency";
  } else if (code === "fee-missing-corresponding-payout") {
    return "The fee has no corresponding payout";
  } else if (code === "is-parking-account") {
    return "Will be transfered to our parking account";
  }
};

type ValidationStatusProps = {
  validationStatus: ValidationStatusType;
};
const ValidationStatus = ({ validationStatus }: ValidationStatusProps) => {
  let status;
  if (validationStatus === "idle") {
    status = <span style={{ color: "gray" }}>Not started 😴</span>;
  } else if (validationStatus === "validating") {
    status = <span style={{ color: "blue" }}>Validating file 🤔</span>;
  } else if (validationStatus === "error") {
    status = <span style={{ color: "red" }}>The file is no good 👎</span>;
  } else if (validationStatus === "error-500") {
    status = <span style={{ color: "red" }}>Something is not right 🤷</span>;
  } else if (validationStatus === "success") {
    status = <span style={{ color: "green" }}>The file looks good 👍</span>;
  }

  return <h2>Validation status: {status}</h2>;
};

type MessagesProps = {
  messages: Message[];
};
const Messages = ({ messages }: MessagesProps) => (
  <table>
    <thead>
      <tr>
        <td>Id</td>
        <td>Type</td>
        <td>Code</td>
        <td>Explanation</td>
      </tr>
    </thead>
    <tbody>
      {messages.map(({ id, code, type }, index) => {
        const description = getMessageDescription(code);
        const color = type === "error" ? "red" : "orange";
        return (
          <tr key={index} style={{ color }}>
            <td>{id}</td>
            <td>{type}</td>
            <td>{code}</td>
            <td>{description}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const ValidatePayouts = () => {
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatusType>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();

  const onCSVParsed = async (data: PapaParseResult[]) => {
    setValidationStatus("validating");

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages: Message[] = await response.json();
      setMessages(messages);
      if (messages.find((message) => message.type === "error")) {
        setValidationStatus("error");
      } else {
        setValidationStatus("success");
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationStatus("error-500");
    }
  };

  const onValidateFile = (file: File) => {
    setValidationStatus("idle");
    setMessages([]);
    setFileName(file.name);
    setInputValue("");
    parseFile(file, onCSVParsed);
  };

  return (
    <div
      style={{
        padding: "24px",
        position: "absolute",
        width: "100%",
        height: "100%",
        border: "3px dashed lightgray",
      }}
      onDrop={(e: any) => {
        onValidateFile(e.dataTransfer.files[0]);
        e.preventDefault();
      }}
      // // See: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations#droptargets
      onDragOver={(e: any) => e.preventDefault()}
    >
      <input
        value={inputValue}
        type="file"
        accept=".csv"
        onChange={(e) => {
          if (e.target.files) {
            onValidateFile(e.target.files[0]);
          }
        }}
      />{" "}
      (or drop file anywhere...)
      {fileName ? (
        <h3>
          File chosen <span style={{ color: "blue" }}>{fileName}</span>
        </h3>
      ) : (
        <h3>No file chosen</h3>
      )}
      <ValidationStatus validationStatus={validationStatus} />
      {!!messages.length && <Messages messages={messages} />}
      {validationStatus === "error-500" && (
        <p style={{ color: "white", backgroundColor: "red", padding: "12px" }}>
          An unexpected error occured. Ask the Product team for details.
        </p>
      )}
    </div>
  );
};

export default ValidatePayouts;
