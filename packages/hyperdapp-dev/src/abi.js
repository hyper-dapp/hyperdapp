import { escapeAtom } from 'hyperdapp';

export function convertABIToPrologCode(abi) {
  const code = [];

  const functions = abi.filter((m) => m.type === "function");

  for (let method of functions) {
    let row = ""; // function-sig: return-value / view / payable

    const { inputs, outputs, name, stateMutability } = method;
    row += escapeAtom(name);

    if (inputs.length) {
      row += '('
      row += inputs
        .map(input => {
          let type = input.type

          if (type === 'tuple') {
            type += '('
            type += input.components
              .map(tupleType => {
                if (tupleType.type === 'tuple') {
                  throw new Error('Nested tuples currently not supported')
                }
                return tupleType.type
              })
              .join(', ')
            type += ')'
          }

          return type
        })
        .join(', ')
      row += ')'
    }

    if (outputs.length) row += `: ${outputs[0].type}`;

    if (["pure", "view", "payable"].includes(stateMutability)) {
      if (row.indexOf(":") !== -1) row += ` / ${stateMutability}`;
      else row += `: ${stateMutability}`;
    }

    code.push(row);
  }

  return code;
}
