// tests/helpers/imaging-operations.ts
import { type APIRequestContext, expect } from '@playwright/test';
import type {
  CreateRequestProcedure,
  CreateRequestProcedureStep,
  DicomStudy,
  Instance,
  OrthancConfiguration,
  RequestProcedure,
  RequestProcedureStep,
  Series,
} from '../../src/types';

const imagingUrl = '/openmrs/ws/rest/v1/imaging';
const worklistUrl = '/openmrs/ws/rest/v1/worklist';

/**
 * Delete a study
 */
export const deleteStudy = async (
  api: APIRequestContext,
  studyId: string,
  deleteOption: 'openmrs' | 'orthanc' = 'openmrs',
) => {
  const res = await api.delete(`${imagingUrl}/study?studyId=${studyId}&deleteOption=${deleteOption}`);
  await expect(res.ok()).toBeTruthy();
};

export const getStudiesByConfig = async (
  api: APIRequestContext,
  configuration: OrthancConfiguration,
  patientUuid: string,
): Promise<DicomStudy[]> => {
  const res = await api.get(`${imagingUrl}/studiesbyconfig?configurationId=${configuration.id}&patient=${patientUuid}`);
  await expect(res.ok()).toBeTruthy();

  const json = await res.json();
  return json.studies ?? [];
};

/**
 * Create a request
 */
export const createRequest = async (
  api: APIRequestContext,
  patientUuid: string,
  request: CreateRequestProcedure,
): Promise<RequestProcedure> => {
  const res = await api.post(`${worklistUrl}/saverequest`, {
    data: { ...request, patientUuid },
    headers: { 'Content-Type': 'application/json' },
  });
  await expect(res.ok()).toBeTruthy();
  return await res.json();
};

/**
 * Delete a request
 */
export const deleteRequest = async (api: APIRequestContext, requestId: number) => {
  const res = await api.delete(`${worklistUrl}/request?requestId=${requestId}`);
  await expect(res.ok()).toBeTruthy();
};

/**
 * Create a procedure step
 */
export const createProcedureStep = async (
  api: APIRequestContext,
  requestId: number,
  step: CreateRequestProcedureStep,
): Promise<RequestProcedureStep> => {
  const res = await api.post(`${worklistUrl}/savestep`, {
    data: { ...step, requestId },
  });
  await expect(res.ok()).toBeTruthy();
  return await res.json();
};

/**
 * Delete a procedure step
 */
export const deleteProcedureStep = async (api: APIRequestContext, stepId: string) => {
  const res = await api.delete(`${worklistUrl}/requeststep?stepId=${stepId}`);
  await expect(res.ok()).toBeTruthy();
};

/**
 * Assign/unassign a study
 */
export const assignStudy = async (api: APIRequestContext, studyId: number, patientUuid: string, isAssign: boolean) => {
  const formData = new FormData();
  formData.append('studyId', studyId.toString());
  formData.append('patient', patientUuid);
  formData.append('isAssign', isAssign.toString());

  const res = await api.post(`${imagingUrl}/assingstudy`, {
    form: formData,
    //headers: { 'Content-Type': 'application/json', },
  });

  await expect(res.ok()).toBeTruthy();
};

/**
 * Link studies from Orthanc
 */
export const linkStudies = async (api: APIRequestContext, configuration: OrthancConfiguration, fetchOption: string) => {
  const res = await api.post(`${imagingUrl}/linkstudies`, {
    form: {
      configurationId: configuration.id.toString(),
      fetchOption,
    },
  });
  await expect(res.ok()).toBeTruthy();
};

/**
 * Upload a study file
 */
export const uploadStudyFile = async (api: APIRequestContext, file: File, configuration: OrthancConfiguration) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('configurationId', configuration.id.toString());

  const res = await api.post(`${imagingUrl}/instances`, { data: formData });
  await expect(res.ok()).toBeTruthy();
};

/**
 * Fetch studies by patient
 */
export const getStudiesByPatient = async (api: APIRequestContext, patientUuid: string): Promise<DicomStudy[]> => {
  const res = await api.get(`${imagingUrl}/studies?patient=${patientUuid}`);
  await expect(res.ok()).toBeTruthy();

  return await res.json();
};

/**
 * Fetch requests by patient
 */
export const getRequestsByPatient = async (
  api: APIRequestContext,
  patientUuid: string,
): Promise<RequestProcedure[]> => {
  const res = await api.get(`${worklistUrl}/patientrequests?patient=${patientUuid}`);
  await expect(res.ok()).toBeTruthy();
  const { data } = await res.json();
  return data as RequestProcedure[];
};

/**
 * Fetch procedure steps
 */
export const getProcedureSteps = async (api: APIRequestContext, requestId: number): Promise<RequestProcedureStep[]> => {
  const res = await api.get(`${worklistUrl}/requeststep?&requestId=${requestId}`);
  await expect(res.ok()).toBeTruthy();
  const { data } = await res.json();
  return data as RequestProcedureStep[];
};

/**
 * Fetch series for a study
 */
export const getStudySeries = async (api: APIRequestContext, studyId: number): Promise<Series[]> => {
  const res = await api.get(`${imagingUrl}/studyseries?studyId=${studyId}`);
  await expect(res.ok()).toBeTruthy();
  const { data } = await res.json();
  return data as Series[];
};

/**
 * Fetch instances for a study series
 */
export const getStudyInstances = async (
  api: APIRequestContext,
  studyId: number,
  seriesInstanceUID: string,
): Promise<Instance[]> => {
  const res = await api.get(`${imagingUrl}/studyinstances?studyId=${studyId}&seriesInstanceUID=${seriesInstanceUID}`);
  await expect(res.ok()).toBeTruthy();
  const { data } = await res.json();
  return data as Instance[];
};

/**
 * Preview an instance
 */
export const previewInstance = async (api: APIRequestContext, orthancInstanceUID: string, studyId: number) => {
  const res = await api.get(
    `${imagingUrl}/previewinstance?orthancInstanceUID=${orthancInstanceUID}&studyId=${studyId}`,
  );
  await expect(res.ok()).toBeTruthy();
  return await res.json();
};
