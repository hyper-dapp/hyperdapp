export const startsWithCapitalLetter = (word) => {
  return word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;
};

export const convertABIToPrologCode = (abi) => {
  const code = [];

  const functions = abi.filter((m) => m.type === "function");

  for (let method of functions) {
    let row = ""; // function-sig: return-value / view / payable

    const { inputs, outputs, name, stateMutability } = method;
    row += startsWithCapitalLetter(name) ? `'${name}'` : name;

    if (inputs.length) {
      row += "(";
      for (let input of inputs) row += `${input.type}, `;
      row = row.slice(0, -2);
      row += ")";
    }

    if (outputs.length) row += `: ${outputs[0].type}`;

    if (["view", "payable"].includes(stateMutability)) {
      if (row.indexOf(":") !== -1) row += ` / ${stateMutability}`;
      else row += `: ${stateMutability}`;
    }

    code.push(row);
  }

  return code;
};
