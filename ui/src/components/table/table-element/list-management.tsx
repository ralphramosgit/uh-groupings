import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getMembersExistInInclude, getMembersExistInExclude, getMembersExistInOwners } from '@/lib/actions';
import { MemberResult } from '@/lib/types';

const ListManagement = ({
    list,
    groupingPath,
    onOpenRemoveMemberModal,
    onOpenRemoveMembersModal,
    checkedMembers
}: {
    list: string;
    groupingPath: string;
    onOpenRemoveMemberModal: (membersInList: MemberResult[], membersNotInList: string[]) => void;
    onOpenRemoveMembersModal?: (membersInList: MemberResult[], membersNotInList: MemberResult[]) => void;
    checkedMembers?: MemberResult[];
}) => {
    const [manageMembers, setManageMembers] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMemSearchFocused, setIsMemSearchFocused] = useState(false);

    const getMembersInList = async () => {
        if (!manageMembers.trim() || manageMembers.split(/[,\s]+/).every((id) => id.trim() === '')) {
            return { members: [], membersNotInList: [] };
        }

        const uhIdentifiers = manageMembers
            .split(/[,\s]+/)
            .map((id) => id.trim())
            .filter((id) => id !== '');

        try {
            let response;

            if (list === 'include') {
                response = await getMembersExistInInclude(groupingPath, uhIdentifiers);
            } else if (list === 'exclude') {
                response = await getMembersExistInExclude(groupingPath, uhIdentifiers);
            } else if (list === 'owners') {
                response = await getMembersExistInOwners(groupingPath, uhIdentifiers);
            }

            const inList = Array.from(
                new Map(response.members.map((member) => [`${member.uid}-${member.uhUuid}`, member])).values()
            );

            const notInList = uhIdentifiers
                .filter((id) => !inList.some((member) => member.uhUuid === id || member.uid === id))
                .map((id) => ({
                    uid: 'N/A',
                    name: '',
                    uhUuid: id,
                    firstName: '',
                    lastName: ''
                }));

            return { membersInList: inList, membersNotInList: notInList };
        } catch (error) {
            console.error('Error fetching members:', error);
            return { members: [], membersNotInList: [] };
        }
    };

    const handleLoadingAndOpenModal = async (callback: () => void) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure state update is processed
        callback();
        setLoading(false);
    };

    const handleRemoveClick = async () => {
        try {
            if (manageMembers.trim()) {
                const { membersInList, membersNotInList } = await getMembersInList();
                console.log(membersInList.length);

                if (membersInList.length === 1) {
                    await handleLoadingAndOpenModal(() =>
                        onOpenRemoveMemberModal?.(membersInList, membersNotInList as string[])
                    );
                } else if (membersInList.length > 1) {
                    await handleLoadingAndOpenModal(() => onOpenRemoveMembersModal?.(membersInList, membersNotInList));
                    console.log('multi removal');
                    console.log(membersNotInList);
                } else {
                    setErrorMessage(`The members you've attempted to remove do not exist.`);
                }
            } else if (checkedMembers?.length) {
                const { membersNotInList } = await getMembersInList();
                if (checkedMembers.length === 1) {
                    await handleLoadingAndOpenModal(() => {
                        console.log('checkedMembers: ', checkedMembers);
                        onOpenRemoveMemberModal?.(checkedMembers, membersNotInList as string[]);
                    });
                } else {
                    await handleLoadingAndOpenModal(() => onOpenRemoveMembersModal?.(checkedMembers, []));
                }
            } else {
                console.error('Error: No members selected for removal.');
                setErrorMessage('Please enter one or more UH members.');
                return;
            }
        } catch (error) {
            setErrorMessage('Please enter one or more UH members.');
            console.error('Error during removal:', error);
        }
    };

    return (
        <div className="d-lg-flex d-block justify-content-lg-between justify-content-start">
            <div className="col-lg-4 pt-3 pl-0 pr-0 mt-lg-0 my-2">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col w-full md:w-[35em] items-start md:flex-row md:justify-between md:items-start">
                        <div className="memSearch relative flex-grow pr-[4px]">
                            <Input
                                placeholder="UH Username or UH Number"
                                title="Enter one or more UH members"
                                value={manageMembers}
                                onChange={(e) => setManageMembers(e.target.value)}
                                onFocus={() => setIsMemSearchFocused(true)}
                                onBlur={() => setIsMemSearchFocused(false)}
                                aria-label={`Enter one or more UH members to add to the ${list} list`}
                                className="h-[44px] w-[300px] md:w-full pr-8"
                            />
                            {manageMembers && isMemSearchFocused && (
                                <button
                                    type="button"
                                    onMouseDown={() => setManageMembers('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2"
                                    aria-label="Clear input"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-blue-500" />
                                </button>
                            )}
                            {errorMessage && (
                                <div className="relative mt-4 md:absolute top-full left-0 bg-red-200 text-red-700 text-base md:mt-2 p-2 rounded w-full ">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center py-2 md:py-0">
                            <div className="memBtns h-[44px]">
                                <Button
                                    variant="default"
                                    size="default"
                                    aria-label="add-member-button"
                                    onClick={() => console.log(`Add to ${list}: ${manageMembers}`)}
                                    className="ml-[2px] h-[44px]"
                                >
                                    Add
                                </Button>
                                <Button
                                    // variant="destructive"
                                    variant="removal"
                                    size="default"
                                    aria-label="remove-member-button"
                                    onClick={() => {
                                        handleRemoveClick()
                                            .then(() => {
                                                console.log('Member Removal Process');
                                            })
                                            .catch((error) => {
                                                console.error('Error during member removal:', error);
                                                setErrorMessage(
                                                    'An error occurred while removing members. Please try again.'
                                                );
                                            });
                                    }}
                                    onBlur={() => {
                                        setLoading(false);
                                        setErrorMessage('');
                                    }}
                                    className="ml-[4px] h-[44px]"
                                >
                                    Remove
                                </Button>
                                {list === 'include' || list === 'exclude' ? (
                                    <Button
                                        variant="default"
                                        size="default"
                                        aria-label="import-file-button"
                                        onClick={() => console.log(`Import file for ${list}`)}
                                        className="ml-[4px] h-[44px]"
                                    >
                                        Import File
                                    </Button>
                                ) : null}
                            </div>
                            <div className="ml-[4px] w-[24px] flex items-center justify-center h-[44px]">
                                {loading ? (
                                    <Spinner size="sm" show={true} className="text-black stroke-[3.0]" />
                                ) : (
                                    <div style={{ visibility: 'hidden' }}>
                                        <Spinner size="sm" show={false} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ListManagement;
