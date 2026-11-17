import GroupingMemberNameCell from '@/app/groupings/[groupingPath]/@tab/_components/grouping-members-table/table-element/grouping-member-name-cell';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('GroupingMemberNameCell', () => {
    const name = 'name';
    const uid = 'uid';
    const uhUuid = 'uhUuid';

    it('should render the name', () => {
        render(<GroupingMemberNameCell name={name} uid={uid} uhUuid={uhUuid} />);
        expect(screen.getByText(name)).toBeInTheDocument();
    });

    it('should render the departmental account icon', () => {
        const { rerender } = render(<GroupingMemberNameCell name={name} uid={'testiwta'} uhUuid={'testiwta'} />);
        expect(screen.getByLabelText('Departmental Account Icon')).toBeInTheDocument();

        rerender(<GroupingMemberNameCell name={name} uid={'dept123'} uhUuid={'dept123'} />);
        expect(screen.getByLabelText('Departmental Account Icon')).toBeInTheDocument();
    });

    it('should not render the departmental account icon for a personal account or missing UH UUID', () => {
        const { rerender } = render(<GroupingMemberNameCell name={name} uid="testiwta" uhUuid="99997010" />);
        expect(screen.queryByLabelText('Departmental Account Icon')).not.toBeInTheDocument();

        rerender(<GroupingMemberNameCell name={name} uid="testiwta" uhUuid="" />);
        expect(screen.queryByLabelText('Departmental Account Icon')).not.toBeInTheDocument();
    });

    describe('Orphan members', () => {
        const orphanName = '25528222 entity not found';

        it('should render N/A and the help link instead of the name', () => {
            render(<GroupingMemberNameCell name={orphanName} uid="" uhUuid="25528222" orphan />);

            expect(screen.getByText('N/A')).toBeInTheDocument();
            expect(
                screen.getByRole('link', { name: 'Click more info about missing member names' })
            ).toBeInTheDocument();
            expect(screen.queryByText(orphanName)).not.toBeInTheDocument();
        });

        it('should not render the departmental account icon', () => {
            render(<GroupingMemberNameCell name={orphanName} uid="25528222" uhUuid="25528222" orphan />);
            expect(screen.queryByLabelText('Departmental Account Icon')).not.toBeInTheDocument();
        });
    });
});
