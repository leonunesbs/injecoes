// components/PatientForm/CreateOrUpdatePatientModal.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createOrUpdatePatient } from '@/utils/manageInjections';
import { createPatientPdfBlob, fillPatientPdfTemplateWithData } from '@/utils/patientPdfGenerator';
import { BasicInfoForm } from './FormSections/BasicInfoForm';
import { IndicationForm } from './FormSections/IndicationForm';
import { InjectionsForm } from './FormSections/InjectionsForm';
import { MedicationForm } from './FormSections/MedicationForm';
import { ObservationsForm } from './FormSections/ObservationsForm';
import { SwalisClassificationForm } from './FormSections/SwalisClassificationForm';
import { patientSchema } from './patientFormSchema';

type FormData = z.infer<typeof patientSchema>;

interface CreateOrUpdatePatientModalProps {
  modal: HTMLDialogElement | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function CreateOrUpdatePatientModal({ modal, showToast }: CreateOrUpdatePatientModalProps) {
  const [loading, setLoading] = useState(false);
  const methods = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      refId: '',
      name: '',
      indication: 'RD/EMD',
      indicationOther: '',
      medication: 'Eylia',
      medicationOther: '',
      swalisClassification: 'A2',
      swalisOther: '',
      observations: '',
      remainingODOption: '0',
      remainingODCustom: undefined,
      remainingOSOption: '0',
      remainingOSCustom: undefined,
      startEye: 'OD',
    },
  });

  const { reset, handleSubmit } = methods;

  const closeModal = useCallback(() => {
    if (modal) {
      modal.close();
      modal.classList.remove('modal-open');
    }
  }, [modal]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const newWindow = window.open('', '_blank');
    try {
      const indication = data.indication === 'Outros' ? data.indicationOther || '' : data.indication;
      const medication = data.medication === 'Outro' ? data.medicationOther || '' : data.medication;
      const swalisClassification =
        data.swalisClassification === 'Outros' ? data.swalisOther || '' : data.swalisClassification;

      const remainingOD =
        // eslint-disable-next-line prettier/prettier
        data.remainingODOption === 'Outro' ? data.remainingODCustom ?? 0 : parseInt(data.remainingODOption, 10);

      const remainingOS =
        // eslint-disable-next-line prettier/prettier
        data.remainingOSOption === 'Outro' ? data.remainingOSCustom ?? 0 : parseInt(data.remainingOSOption, 10);

      const patientData = {
        refId: data.refId,
        name: data.name,
        indication, // Incluído aqui
        medication,
        swalisClassification,
        remainingOD,
        remainingOS,
        startEye: data.startEye,
        observations: data.observations,
      };

      // Gerar PDF (se aplicável)
      const modelPDFBytes = await fetch('/modeloAA.pdf').then((res) => res.arrayBuffer());
      const pdfBytes = await fillPatientPdfTemplateWithData(patientData, modelPDFBytes);
      const blobUrl = createPatientPdfBlob(pdfBytes);

      if (newWindow) {
        newWindow.location.href = blobUrl;
      } else {
        showToast('Por favor, permita pop-ups para visualizar o PDF.', 'error');
      }

      await createOrUpdatePatient({
        refId: patientData.refId,
        name: patientData.name,
        indication: patientData.indication,
        remainingOD: patientData.remainingOD,
        remainingOS: patientData.remainingOS,
        startEye: patientData.startEye,
      });

      reset();
      showToast('Paciente salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to submit:', error);
      showToast('Falha ao salvar o paciente.', 'error');
      if (newWindow) {
        newWindow.close();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      id="patient-form"
      className="modal modal-open"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      role="dialog"
    >
      <div className="modal-box max-w-2xl">
        <h3 id="modal-title" className="font-bold text-xl mb-4">
          Adicionar ou Atualizar Registro
        </h3>
        <FormProvider {...methods}>
          <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)} aria-describedby="form-errors">
            <BasicInfoForm />
            <IndicationForm />
            <MedicationForm />
            <SwalisClassificationForm />
            <ObservationsForm />
            <InjectionsForm />

            {/* Aviso */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
              <strong>Importante:</strong> Ao confirmar, a única informação vigente será do registro criado por último.
              Caso sejam criados dois registros para o mesmo paciente com informações diferentes, será considerada a
              criada por último.
            </p>

            {/* Botões de ação */}
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Salvar'}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  closeModal();
                }}
                aria-label="Fechar Modal"
              >
                Fechar
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          onClick={() => {
            closeModal();
          }}
          aria-label="Fechar Modal"
        >
          Fechar
        </button>
      </form>
    </dialog>
  );
}
