import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RequestProcedureTable, { RequestProcedureTableProps } from './requests-details-table.component';
import { createGlobalStore, usePagination } from '@openmrs/esm-framework';
import { RequestProcedure } from '../../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  launchWorkspace: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
  createGlobalStore: jest.fn(() => ({
    getState: jest.fn(),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  })),
  usePagination: jest.fn((items, pageSize) => ({
    results: items?.slice(0, pageSize) || [],
    goto: jest.fn(),
    currentPage: 1,
  })),
}));

// Mock other OpenMRS libs
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  CardHeader: ({ children }: any) => <div>{children}</div>,
  compare: jest.fn((a, b) => (a > b ? 1 : -1)),
  PatientChartPagination: ({ pageNumber }: any) => <div>Page {pageNumber}</div>,
  EmptyState: ({ displayText, headerTitle }: any) => (
    <div>
      {headerTitle}: {displayText}
    </div>
  ),
  useLaunchWorkspaceRequiringVisit: (workspace: any) => jest.fn(),
}));

describe('RequestProcedureTable', () => {
  const patientUuid = 'patient-12345';

  const mockRequests = [
    {
      id: 1,
      status: 'scheduled',
      priority: 'high',
      requestingPhysician: 'Dr. Who',
      studyInstanceUID: 'UID123',
      requestDescription: 'MRI scan',
      orthancConfiguration: { orthancBaseUrl: 'http://orthanc.local' },
      patientUuid: patientUuid,
      accessionNumber: 'ACC123',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Empty State when no requests are available', async () => {
    await act(async () => {
      render(<RequestProcedureTable requests={[]} patientUuid={patientUuid} />);
    });
    expect(screen.getByText(/No requests found/i)).toBeInTheDocument();
  });
});
