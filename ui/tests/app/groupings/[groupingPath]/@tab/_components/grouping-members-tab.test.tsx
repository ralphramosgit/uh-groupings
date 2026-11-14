import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { GroupingGroupMember } from '@/lib/types';
import GroupingMembersTab from '@/app/groupings/[groupingPath]/@tab/_components/grouping-members-tab';
import { createMockProviders } from 'tests/vitest.setup';
import * as Actions from '@/lib/actions';
import SortBy from '@/app/groupings/[groupingPath]/@tab/_components/grouping-members-table/table-element/sort-by';

vi.mock('@/lib/actions');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    })
}));

const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE as string);

describe('GroupingMembersTab', () => {
    const groupingPath = 'tmp:testiwta:testiwta-aux';
    const group = 'include';
    const groupPath = `${groupingPath}:${group}`;

    const mockGroupingMembers = {
        resultCode: 'SUCCESS',
        groupPath: groupingPath,
        size: pageSize,
        members: Array.from(
            { length: 20 },
            (_, i) =>
                ({
                    uid: `uid-${i}`,
                    uhUuid: `uhUuid-${i}`,
                    name: `name-${i}`,
                    firstName: `firstName-${i}`,
                    lastName: `lastName-${i}`
                }) as GroupingGroupMember
        )
    };

    it('should render the GroupingsMembersTable', async () => {
        vi.spyOn(Actions, 'getGroupingMembers').mockResolvedValue(mockGroupingMembers);
        render(
            await GroupingMembersTab({
                params: { groupingPath },
                searchParams: {
                    page: '1',
                    sortBy: 'name',
                    isAscending: 'true'
                }
            }),
            { wrapper: createMockProviders() }
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should parse the searchParams', async () => {
        vi.spyOn(Actions, 'getGroupingMembers').mockResolvedValue(mockGroupingMembers);
        vi.spyOn(Actions, 'getNumberOfGroupingMembers').mockResolvedValue(pageSize * 3);
        render(
            await GroupingMembersTab({
                params: { groupingPath },
                searchParams: {
                    page: 'notAnInteger',
                    sortBy: '123',
                    isAscending: 'yes'
                }
            }),
            { wrapper: createMockProviders() }
        );

        // Verify pagination bar is on page 1.
        expect(await screen.findByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();

        // Verify sort arrow is sorting descending for the name column.
        expect(
            within(screen.getByRole('columnheader', { name: 'Name' })).getByTestId('chevron-down-icon')
        ).toBeInTheDocument();
    });

    it('should call getGroupingMembers', async () => {
        vi.spyOn(Actions, 'getGroupingMembers').mockResolvedValue(mockGroupingMembers);
        const searchParams = {
            page: 1,
            size: pageSize,
            sortBy: SortBy.NAME,
            isAscending: true,
            searchString: 'test'
        };

        const { rerender } = render(
            await GroupingMembersTab({
                params: { groupingPath },
                searchParams: {
                    page: '1',
                    sortBy: 'name',
                    isAscending: 'true',
                    search: 'test'
                }
            }),
            { wrapper: createMockProviders() }
        );
        expect(Actions.getGroupingMembers).toHaveBeenCalledWith(groupingPath, searchParams);

        rerender(
            await GroupingMembersTab({
                params: { groupingPath },
                searchParams: {
                    page: '1',
                    sortBy: 'name',
                    isAscending: 'true',
                    search: 'test'
                },
                group
            })
        );
        expect(Actions.getGroupingMembers).toHaveBeenCalledWith(groupPath, searchParams);
    });

    describe('Orphan members', () => {
        // The API fills an orphan's name with an "entity not found" placeholder.
        const orphanMember = {
            resultCode: 'SUCCESS',
            uid: '',
            uhUuid: '25528222',
            name: '25528222 entity not found',
            firstName: '',
            lastName: '',
            orphan: true
        };
        // IAM test user testiwta.
        const namedMember = {
            resultCode: 'SUCCESS',
            uid: 'testiwta',
            uhUuid: '99997010',
            name: 'Testf-iwt-a TestIAM-staff',
            firstName: 'Testf-iwt-a',
            lastName: 'TestIAM-staff',
            orphan: false
        };
        // IAM test user testiwtb, with the name removed to simulate a transient data glitch.
        const namelessMember = {
            resultCode: 'SUCCESS',
            uid: 'testiwtb',
            uhUuid: '99997027',
            name: '',
            firstName: '',
            lastName: '',
            orphan: false
        };
        const membersWithOrphan = {
            ...mockGroupingMembers,
            members: [orphanMember, namedMember, namelessMember]
        };

        it('should keep orphan members and drop nameless non-orphan members', async () => {
            vi.spyOn(Actions, 'getGroupingMembers').mockResolvedValue(membersWithOrphan);
            render(
                await GroupingMembersTab({
                    params: { groupingPath },
                    searchParams: { page: '1', sortBy: 'name', isAscending: 'true' },
                    group
                }),
                { wrapper: createMockProviders() }
            );

            expect(screen.getByText('25528222')).toBeInTheDocument();
            expect(screen.getByText('99997010')).toBeInTheDocument();
            expect(screen.queryByText('99997027')).not.toBeInTheDocument();
        });

        it('should keep orphan members on any page and sort order', async () => {
            vi.spyOn(Actions, 'getGroupingMembers').mockResolvedValue(membersWithOrphan);
            render(
                await GroupingMembersTab({
                    params: { groupingPath },
                    searchParams: { page: '2', sortBy: 'uhUuid', isAscending: 'false' },
                    group
                }),
                { wrapper: createMockProviders() }
            );

            expect(Actions.getGroupingMembers).toHaveBeenCalledWith(groupPath, {
                page: 2,
                size: pageSize,
                sortBy: SortBy.UH_UUID,
                isAscending: false,
                searchString: undefined
            });
            expect(screen.getByText('25528222')).toBeInTheDocument();
        });
    });
});
