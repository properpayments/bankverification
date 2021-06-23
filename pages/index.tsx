import Papa from "papaparse";

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
          console.log(data);
        },
      });
    }
  };

  return <input type="file" accept=".csv" onChange={onChange} />;
};

export default Upload;
