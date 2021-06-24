import { useState } from "react";
import { parseFile } from "../utils/parseCSV";
import { Message, MessageName, PapaParseResult } from "../utils/types";

const getMessageDescription = (name: MessageName) => {
  if (name === "missing-virtual-account") {
    return "The sender is not a virtual bank account";
  } else if (name === "account-not-in-approved-list") {
    return "Destination is not in list of approved accounts";
  } else if (name === "fee-wrong-account") {
    return "Expected destination to be operations account";
  } else if (name === "fee-missing-corresponsing-payout") {
    return "The fee has no corresponding payout";
  } else if (name === "is-parking-account") {
    return "Will be transfered to our parking account";
  }
};

type ValidationStatus = "idle" | "validating" | "success" | "error";

const Upload = () => {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    "idle"
  );
  const [messages, setMessages] = useState<Message[]>([]);

  const onCSVParsed = async (data: PapaParseResult[]) => {
    setValidationStatus("validating");
    const response = await fetch("/api/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const list: Message[] = await response.json();
    setMessages(list);
    if (list.find(({ type }) => type === "error")) {
      setValidationStatus("error");
    } else {
      setValidationStatus("success");
    }
  };

  const onChange = (event: any) => {
    if (event.target.files) {
      parseFile(event.target.files[0], onCSVParsed);
    }
  };

  return (
    <>
      <input type="file" accept=".csv" onChange={onChange} />
      <p>Validation status: {validationStatus}</p>
      {messages.map(({ id, name, type }, index) => {
        const description = getMessageDescription(name);
        const color = type === "error" ? "red" : "black";
        return (
          <p key={index} style={{ color }}>
            {id}: {description}
          </p>
        );
      })}
    </>
  );
};

export default Upload;
