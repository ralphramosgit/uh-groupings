import { MemberResult } from './types';

type MemberLike = Pick<MemberResult, 'name' | 'uhUuid' | 'orphan'>;

export const ORPHAN_HELP_URL =
    'https://uhawaii.atlassian.net/wiki/spaces/UHIAM/pages/2482569221/UH+Groupings+Missing+Member+Names';

/**
 * Check if a member is an orphan: listed in Grouper by uhUuid but no longer found in LDAP.
 *
 * @param member - The member to check
 *
 * @returns True if the API flagged the member as an orphan
 */
export const isOrphanMember = (member?: MemberLike | null): boolean => member?.orphan === true;

/**
 * Get the label used to identify a member in aria-label attributes. An orphan's name is Grouper's
 * "entity not found" placeholder, so its uhUuid is used instead.
 *
 * @param member - The member to label
 *
 * @returns The uhUuid for an orphan, otherwise the name, falling back to the uhUuid
 */
export const memberLabelForAria = (member?: MemberLike | null): string => {
    if (!member) {
        return '';
    }
    if (isOrphanMember(member)) {
        return member.uhUuid ?? '';
    }
    return member.name || member.uhUuid || '';
};

/**
 * Check if a member should be displayed in a member list. Orphans are always displayed; nameless
 * non-orphans are transient data glitches and are hidden.
 *
 * @param member - The member to check
 *
 * @returns True if the member should be displayed
 */
export const isDisplayableMember = (member: MemberLike): boolean => isOrphanMember(member) || !!member.name?.trim();
