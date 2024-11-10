// components/PatientForm/patientFormSchema.ts

import { z } from 'zod';

// Opções para Indicações, Medicações e Classificação Swalis
export const indicationOptions = ['RD/EMD', 'RD/HV', 'DMRI', 'OV', 'MNVSR', 'Outros'];
export const medicationOptions = ['Lucentis', 'Avastin', 'Eylia', 'Outro'];
export const swalisOptions = ['A1', 'A2', 'B', 'C', 'D'];

// Mapas com descrições das categorias
export const swalisDescriptions: { [key: string]: string } = {
  A1: 'Paciente com risco de deterioração clínica iminente. Necessidade de hospitalização.',
  A2: 'Paciente com as atividades diárias completamente prejudicadas por dor, disfunção ou incapacidade. Risco de incurabilidade.',
  B: 'Paciente com prejuízo acentuado das atividades diárias por dor, disfunção ou incapacidade.',
  C: 'Paciente com prejuízo mínimo das atividades diárias por dor, disfunção ou incapacidade.',
  D: 'Não há prejuízo para as atividades diárias.',
};

export const indicationDescriptions: { [key: string]: string } = {
  'RD/EMD': 'Edema macular diabético',
  'RD/HV': 'Hemorragia vítrea diabética',
  DMRI: 'Degeneração macular relacionada à idade',
  OV: 'Oclusão venosa',
  MNVSR: 'Membrana neovascular subretiniana',
};

export const patientSchema = z
  .object({
    refId: z
      .string()
      .min(1, 'O ID do Paciente não pode ser vazio')
      .regex(/^\d+$/, 'O ID do Paciente deve ser um número natural')
      .transform((val) => val.replace(/^0+/, '')), // Remove zeros à esquerda
    name: z.string().min(1, 'O nome do paciente é obrigatório').toUpperCase(),
    indication: z.string().min(1, 'A indicação é obrigatória').toUpperCase(),
    indicationOther: z.string().optional(),
    medication: z.string().min(1, 'A medicação indicada é obrigatória'),
    medicationOther: z.string().optional(),
    swalisClassification: z.string().min(1, 'A Classificação Swalis é obrigatória'),
    swalisOther: z.string().optional(),
    observations: z.string().optional(),
    remainingODOption: z.enum(['0', '1', '2', '3', 'Outro']).default('0'),
    remainingODCustom: z.number().min(0, 'Valor não pode ser negativo').optional().nullable(),
    remainingOSOption: z.enum(['0', '1', '2', '3', 'Outro']).default('0'),
    remainingOSCustom: z.number().min(0, 'Valor não pode ser negativo').optional().nullable(),
    startEye: z.enum(['OD', 'OS']),
  })
  .superRefine((data, ctx) => {
    // Validações adicionais
    if (data.indication === 'Outros' && !data.indicationOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a indicação',
        path: ['indicationOther'],
      });
    }

    if (data.medication === 'Outro' && !data.medicationOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a medicação',
        path: ['medicationOther'],
      });
    }

    if (data.swalisClassification === 'Outros' && !data.swalisOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a classificação Swalis',
        path: ['swalisOther'],
      });
    }

    if (data.remainingODOption === 'Outro' && data.remainingODCustom === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a quantidade para OD',
        path: ['remainingODCustom'],
      });
    }

    if (data.remainingOSOption === 'Outro' && data.remainingOSCustom === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a quantidade para OS',
        path: ['remainingOSCustom'],
      });
    }
  });
