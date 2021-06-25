import { useState } from "react";
import { parseFile } from "~utils/parseCSV";
import { Message, MessageCode, PapaParseResult } from "~types";

type ValidationStatusType = "idle" | "validating" | "success" | "error";

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
  } else if (validationStatus === "success") {
    status = <span style={{ color: "green" }}>The file looks good 👍</span>;
  }

  return <h2>Validation status: {status}</h2>;
};

type MessagesProps = {
  messages: Message[];
};
const Messages = ({ messages }: MessagesProps) => {
  if (messages.find((message) => message.code === "invalid-file-format")) {
    return <p>The file is unusable. Ask the Product team for details...</p>;
  }
  return (
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
};

const ValidatePayouts = () => {
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatusType>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [fileName, setFileName] = useState();

  const onCSVParsed = async (data: PapaParseResult[]) => {
    setValidationStatus("validating");

    const response = await fetch("/api/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const messages: Message[] = await response.json();
    setMessages(messages);

    if (messages.find(({ type }) => type === "error")) {
      setValidationStatus("error");
    } else {
      setValidationStatus("success");
    }
  };

  const onChange = (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setValidationStatus("idle");
      setMessages([]);
      setFileName(file.name);
      setInputValue("");
      parseFile(file, onCSVParsed);
    }
  };

  return (
    <>
      <input value={inputValue} type="file" accept=".csv" onChange={onChange} />
      {fileName ? (
        <h3>
          File chosen <span style={{ color: "blue" }}>{fileName}</span>
        </h3>
      ) : (
        <h3>No file chosen</h3>
      )}
      <ValidationStatus validationStatus={validationStatus} />
      {!!messages.length && <Messages messages={messages} />}
    </>
  );
};

export default ValidatePayouts;
