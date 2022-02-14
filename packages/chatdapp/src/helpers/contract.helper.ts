import { ContractMethod } from "../models/contract-method";

export const startsWithCapitalLetter = (word: string) => {
  return word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;
};

export const convertABIToPrologCode = (
  address: string,
  abi: ContractMethod[]
) => {
  let code = `address('${address}', '${address}').\n`;
  code += `abi('${address}', [\n`;

  for (let method of abi.filter((m) => m.type === "function")) {
    let row = " "; // function-sig: return-value / view / payable

    const { inputs, outputs, name, stateMutability } = method;
    row += startsWithCapitalLetter(name) ? `'${name}'` : name;

    if (inputs.length) {
      row += "(";
      for (let input of inputs) row += `${input.type}, `;
      row = row.slice(0, -2);
      row += ")";
    }

    if (outputs.length) row += `: ${outputs[0].type} / `;

    if (["view", "payable"].includes(stateMutability)) {
      if (row.indexOf(":") !== -1) row += stateMutability;
      else row += `: ${stateMutability}`;
    }

    row += ",\n";
    code += row;
  }

  code = code.slice(0, -2);
  code += `\n]).`;

  return code;
};
