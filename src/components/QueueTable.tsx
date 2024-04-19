import { Data } from '@/app/page3';

interface QueueTableProps {
  queuedData: Data[];
}

export function QueueTable({ queuedData }: QueueTableProps) {
  if (!queuedData.length) return <></>;
  return (
    <div className="overflow-x-auto max-h-96 rounded">
      <table className="table bg-base-200">
        <thead>
          <tr className="sticky top-0 bg-base-300">
            <th>N prontuário</th>
            <th>Nome do paciente</th>
            <th>Nome do staff</th>
            <th>Data do procedimento</th>
            <th>Tipo de tratamento</th>
          </tr>
        </thead>
        <tbody>
          {queuedData.map(({ patientId, patientName, staffName, procedureDate, treatmentType }) => (
            <tr key={patientId}>
              <td>{patientId}</td>
              <td>{patientName}</td>
              <td>{staffName}</td>
              <td>
                {new Date(procedureDate).toLocaleDateString('pt-br', {
                  timeZone: 'UTC',
                  dateStyle: 'short',
                })}
              </td>
              <td>{treatmentType}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-base-300">
          <tr>
            <th>Total:</th>
            <th colSpan={4}>{queuedData.length}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
