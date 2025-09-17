import { expect } from '@playwright/test';
import { getStudiesByPatient, getStudiesByConfig, assignStudy } from '../commands/imaging-operations';
import { test } from '../core';

let patientUuid: string;

test.beforeEach(async ({ api, patient }) => {
  patientUuid = patient.uuid;
  console.log('+++++++ Initial patient uuid: ', patient.uuid);
});

test.describe('ImagingDetailedSummary - Link Study workflow', () => {
  const orthancConfiguration = { id: 1, orthancBaseUrl: 'http://localhost:8052' };

  test('link a study and display it in the studies table', async ({ page, api }) => {
    await page.goto(`${process.env.E2E_BASE_URL}/spa/patient/${patientUuid}/chart/Imaging#`);

    await expect(page.getByText(/No studies found/i).first()).toBeVisible();

    // Fetch all available studies for this patient config
    const allStudies = await getStudiesByConfig(api, orthancConfiguration, patientUuid);
    expect(allStudies).not.toBeNull();
    expect(allStudies.length).toBeGreaterThan(0);

    // Pick the first study and assign it to this patient
    const studyToAssign = allStudies[0];
    await assignStudy(api, studyToAssign.id, patientUuid, true);

    // Assert the study is now linked to the patient
    const studiesAssigned = await getStudiesByPatient(api, patientUuid);
    expect(studiesAssigned.length).toBeGreaterThan(0);
    expect(studiesAssigned[0].id).not.toBeNull();
    expect(studiesAssigned[0].id).toBe(studyToAssign.id);

    // Verify it shows in the UI
    await page.reload();
    await expect(page.getByText(studiesAssigned[0].studyDescription)).toBeVisible();
    await expect(page.getByText(studiesAssigned[0].patientName)).toBeVisible();
    await expect(page.getByText(studiesAssigned[0].studyDate)).toBeVisible();
  });
});
