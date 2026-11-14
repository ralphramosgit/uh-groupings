import { describe, expect, it } from 'vitest';
import {
    isDisplayableMember,
    isOrphanMember,
    memberLabelForAria,
    mergeWhereListed,
    ORPHAN_HELP_URL
} from '@/lib/member-utils';

describe('member-utils', () => {
    const orphan = {
        name: '25528222 entity not found',
        uhUuid: '25528222',
        orphan: true
    };
    // IAM test user testiwta.
    const named = { name: 'Testf-iwt-a TestIAM-staff', uhUuid: '99997010', orphan: false };
    // IAM test user testiwtb, with the name removed to simulate a transient data glitch.
    const nameless = { name: '', uhUuid: '99997027', orphan: false };

    it('should point ORPHAN_HELP_URL to the Missing Member Names help page', () => {
        expect(ORPHAN_HELP_URL).toBe(
            'https://uhawaii.atlassian.net/wiki/spaces/UHIAM/pages/2482569221/UH+Groupings+Missing+Member+Names'
        );
    });

    describe('isOrphanMember', () => {
        it('should be true only when the API sets orphan to true', () => {
            expect(isOrphanMember(orphan)).toBe(true);
            expect(isOrphanMember(named)).toBe(false);
            expect(isOrphanMember({ ...orphan, orphan: false })).toBe(false);
            expect(isOrphanMember({ name: '', uhUuid: '25528222' })).toBe(false);
            expect(isOrphanMember(null)).toBe(false);
            expect(isOrphanMember(undefined)).toBe(false);
        });
    });

    describe('memberLabelForAria', () => {
        it('should use the uhUuid for an orphan instead of the entity-not-found name', () => {
            expect(memberLabelForAria(orphan)).toBe('25528222');
        });

        it('should use the name for a regular member', () => {
            expect(memberLabelForAria(named)).toBe('Testf-iwt-a TestIAM-staff');
        });

        it('should fall back to the uhUuid for a nameless member', () => {
            expect(memberLabelForAria(nameless)).toBe('99997027');
        });

        it('should return an empty string for a missing member', () => {
            expect(memberLabelForAria(null)).toBe('');
            expect(memberLabelForAria(undefined)).toBe('');
        });
    });

    describe('isDisplayableMember', () => {
        it('should display orphans and named members', () => {
            expect(isDisplayableMember(orphan)).toBe(true);
            expect(isDisplayableMember(named)).toBe(true);
        });

        it('should hide nameless non-orphan members', () => {
            expect(isDisplayableMember(nameless)).toBe(false);
            expect(isDisplayableMember({ ...nameless, name: '   ' })).toBe(false);
        });

        it('should keep orphans and drop nameless members when filtering a list', () => {
            expect([orphan, named, nameless].filter(isDisplayableMember)).toEqual([orphan, named]);
        });
    });

    describe('mergeWhereListed', () => {
        // The members endpoint also sends uid. An orphan's uid is empty.
        const members = [
            { ...orphan, uid: '' },
            { ...named, uid: 'testiwta' }
        ];

        it('should keep the orphan flag when the response sends orphan as false', () => {
            const response = members.map((member) => ({ ...member, orphan: false, whereListed: 'Basis' }));
            const [mergedOrphan] = mergeWhereListed(members, response);

            expect(mergedOrphan.orphan).toBe(true);
            expect(mergedOrphan.whereListed).toBe('Basis');
        });

        it('should match whereListed by uhUuid, not by position', () => {
            const response = [
                { ...members[1], whereListed: 'Include' },
                { ...members[0], orphan: false, whereListed: 'Basis & Include' }
            ];
            const whereListed = mergeWhereListed(members, response).map((member) => member.whereListed);

            expect(whereListed).toEqual(['Basis & Include', 'Include']);
        });

        it('should leave whereListed undefined while the response is loading', () => {
            const merged = mergeWhereListed(members, undefined);

            expect(merged.map((member) => member.whereListed)).toEqual([undefined, undefined]);
            expect(merged.map((member) => member.uhUuid)).toEqual(['25528222', '99997010']);
        });

        it('should not change the original members', () => {
            const merged = mergeWhereListed(members, []);

            expect(merged[0]).not.toBe(members[0]);
            expect(members[0]).not.toHaveProperty('whereListed');
        });
    });
});
