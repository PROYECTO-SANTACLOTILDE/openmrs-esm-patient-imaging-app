import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import SeriesDetailsTable, { SeriesDetailsTableProps } from './series-details-table.component';
import * as api from '../../api';
import { usePagination } from '@openmrs/esm-framework';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

jest.mock('../../api');
jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(() => 'desktop'),
  showModal: jest.fn(),
  usePagination: jest.fn((items, pageSize) => ({
    results: items?.slice(0, pageSize) || [],
    goTo: jest.fn(),
    currentPage: 1,
  })),
  TrashCanIcon: (props: any) => <span data-testid="trash-icon" {...props} />,
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  PatientChartPagination: ({ pageNumber }: any) => <div>Page {pageNumber}</div>,
  EmptyState: ({ displayText, headerTitle }: any) => (
    <div>
      {headerTitle}: {displayText}
    </div>
  ),
  compare: jest.fn((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
}));

describe('SeriesDetailsTable', () => {
  const mockSeries = [
    {
      seriesInstanceUID: 'SERIES1',
      modality: 'CT',
      seriesDate: '2025-08-29',
      seriesDescription: 'Head scan',
      orthancSeriesUID: 'UID123',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePagination as jest.Mock).mockReturnValue({
      results: mockSeries,
      currentPage: 1,
      goTo: jest.fn(),
    });
  });

  it('renders EmptyState when no series are available', async () => {
    (api.useStudySeries as jest.Mock).mockReturnValue({
      results: [],
      error: null,
      isLoading: true,
      isValidating: false,
    });

    await act(async () => {
      render(
        <SeriesDetailsTable
          studyId={1}
          studyInstanceUID={'1.2.3'}
          patientUuid={'patient-123'}
          orthancBaseUrl={'http://orthanc.local'}
        />,
      );
    });

    expect(screen.getByText(/Series: No series available/i)).toBeInTheDocument();
  });

  it('renders series rows when data is returned', async () => {
    (api.useStudySeries as jest.Mock).mockReturnValue({
      data: mockSeries,
      error: null,
      isLoading: true,
      isValidating: false,
    });

    await act(async () => {
      render(
        <SeriesDetailsTable
          studyId={1}
          studyInstanceUID={'1.2.3'}
          patientUuid={'patient-123'}
          orthancBaseUrl={'http://orthanc.local'}
        />,
      ) as any;
    });

    expect(screen.getAllByText(/description/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Modality/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Series UID/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Action/i).length).toBeGreaterThan(0);

    // Row values
    expect(screen.getByText('SERIES1')).toBeInTheDocument();
    expect(screen.getByText('CT')).toBeInTheDocument();
    expect(screen.getByText('Head scan')).toBeInTheDocument();
  });
});
