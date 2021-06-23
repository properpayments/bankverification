import Papa from "papaparse";
import getPayments from "../utils/getPayments";
import { PapaParseResult } from "../utils/types";

const papaParseOptions = {
  delimiter: ";",
  skipEmptyLines: true,
  newline: "\n",
  header: true,
};

const Upload = () => {
  const onChange = (event: any) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        ...papaParseOptions,
        complete: ({ data }) => {
          const payments = getPayments(data as PapaParseResult);
          console.log(payments);
        },
      });
    }
  };

  return <input type="file" accept=".csv" onChange={onChange} />;
};

export default Upload;
