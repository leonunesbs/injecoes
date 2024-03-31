import { Dispatch, SetStateAction } from 'react';

interface AdvancedConfigProps {
  position: {
    startLine: number;
    idColumn: number;
    patientColumn: number;
    staffColumn: number;
  };
  setPosition: Dispatch<
    SetStateAction<{
      startLine: number;
      idColumn: number;
      patientColumn: number;
      staffColumn: number;
    }>
  >;
}

export function AdvancedConfig({ position, setPosition }: AdvancedConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="form-control">
        <label htmlFor="" className="text-xs">
          Linha inicial
        </label>
        <input
          type="number"
          className="input input-bordered input-xs"
          placeholder="Linha inicial"
          onChange={(e) =>
            setPosition({
              ...position,
              startLine: parseInt(e.target.value),
            })
          }
          value={position.startLine}
        />
      </div>
      <div className="form-control">
        <label htmlFor="" className="text-xs">
          Coluna ID
        </label>
        <input
          type="number"
          className="input input-bordered input-xs"
          placeholder="Coluna ID"
          onChange={(e) =>
            setPosition({
              ...position,
              idColumn: parseInt(e.target.value),
            })
          }
          value={position.idColumn}
        />
      </div>
      <div className="form-control">
        <label htmlFor="" className="text-xs">
          Coluna nome
        </label>
        <input
          type="number"
          className="input input-bordered input-xs"
          placeholder="Coluna Nome"
          onChange={(e) =>
            setPosition({
              ...position,
              patientColumn: parseInt(e.target.value),
            })
          }
          value={position.patientColumn}
        />
      </div>
      <div className="form-control">
        <label htmlFor="" className="text-xs">
          Coluna staff
        </label>
        <input
          type="number"
          className="input input-bordered input-xs"
          placeholder="Coluna Staff"
          onChange={(e) =>
            setPosition({
              ...position,
              staffColumn: parseInt(e.target.value),
            })
          }
          value={position.staffColumn}
        />
      </div>
    </div>
  );
}
