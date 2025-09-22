import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import SeriesDetailsTable from './series-details-table.component';
import * as api from '../../api';
import { usePagination, showModal } from '@openmrs/esm-framework';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

const mockSeries = [
  {
    seriesInstanceUID: 'SERIES1',
    modality: 'CT',
    seriesDate: '2025-08-29',
    seriesDescription: 'Head scan',
    orthancSeriesUID: 'UID123',
  },
  {
    seriesInstanceUID: 'SERIES2',
    modality: 'MRI',
    seriesDate: '2025-08-30',
    seriesDescription: 'Brain scan',
    orthancSeriesUID: 'UID124',
  },
];

jest.mock('../../api');
jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(() => 'desktop'),
  showModal: jest.fn(),
  usePagination: jest.fn(() => ({
    results: mockSeries,
    goTo: jest.fn(),
    currentPage: 1,
  })),
  TrashCanIcon: (props: any) => <span data-testid="trash-icon" {...props} />,
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  PatientChartPagination: ({ onPageNumberChange }: any) => (
    <button onClick={() => onPageNumberChange({ page: 2 })}>Next</button>
  ),

  EmptyState: ({ displayText, headerTitle }: any) => (
    <div>
      {headerTitle}: {displayText}
    </div>
  ),
  compare: jest.fn((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
}));

describe('SeriesDetailsTable', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders EmptyState when no series are available', async () => {
    (api.useStudySeries as jest.Mock).mockReturnValue({
      results: [],
      error: null,
      isLoading: false,
      isValidating: false,
    });

    await act(async () => {
      render(
        <SeriesDetailsTable
          studyId={1}
          studyInstanceUID="1.2.3"
          patientUuid="patient-123"
          orthancBaseUrl="http://orthanc.local"
        />,
      );
    });

    expect(screen.getByText(/Series: No series available/i)).toBeInTheDocument();
  });

  it('renders rows and triggers row actions', async () => {
    (api.useStudySeries as jest.Mock).mockReturnValue({
      data: mockSeries,
      error: null,
      isLoading: false,
      isValidating: false,
    });

    await act(async () => {
      render(
        <SeriesDetailsTable
          studyId={1}
          studyInstanceUID="1.2.3"
          patientUuid="patient-123"
          orthancBaseUrl="http://orthanc.local"
        />,
      );
    });

    // check row values
    const row1 = screen
      .getAllByRole('row')
      .find((r) => within(r).queryByText((content) => content.includes('SERIES1')));
    expect(row1).toBeTruthy();

    const row2 = screen
      .getAllByRole('row')
      .find((r) => within(r).queryByText((content) => content.includes('SERIES2')));
    expect(row2).toBeTruthy();

    expect(screen.getByText('CT')).toBeInTheDocument();
    expect(screen.getByText('Head scan')).toBeInTheDocument();
    expect(screen.getByText('MRI')).toBeInTheDocument();
    expect(screen.getByText('Brain scan')).toBeInTheDocument();

    // Click triggers modal
    const trashIcon = screen.getAllByTestId('trash-icon')[0];
    fireEvent.click(trashIcon);
    expect(showModal).toHaveBeenCalled();
  });

  it('triggers pagination goto function', async () => {
    const goToMock = jest.fn();
    (usePagination as jest.Mock).mockReturnValue({
      results: mockSeries,
      currentPage: 1,
      goTo: goToMock,
    });

    await act(async () =>
      render(
        <SeriesDetailsTable
          studyId={1}
          studyInstanceUID="1.2.3"
          patientUuid="patient-123"
          orthancBaseUrl="http://orthanc.local"
        />,
      ),
    );

    // simulate page change
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(goToMock).toHaveBeenCalledWith(2);
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
