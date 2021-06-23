import Papa from "papaparse";
import { PapaParseResult } from "../utils/types";

const papaParseOptions = {
  delimiter: ";",
  skipEmptyLines: true,
  newline: "\n",
  header: true,
};

const Upload = () => {
  const onCSVParsed = async ({ data }: { data: PapaParseResult }) => {
    const response = await fetch("/api/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await response.json();
    console.log(json);
  };

  const onChange = (event: any) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        ...papaParseOptions,
        complete: onCSVParsed,
      });
    }
  };

  return <input type="file" accept=".csv" onChange={onChange} />;
};

export default Upload;
