import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { MemberResult } from '@/lib/types';
import { removeExcludeMembers, removeIncludeMembers, removeOwners } from '@/lib/actions';

const RemoveMemberModal = ({
    isOpen,
    onClose,
    memberToRemove,
    membersNotInList,
    group,
    groupingPath,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    memberToRemove: MemberResult;
    membersNotInList?: string[];
    group: string;
    groupingPath: string;
    onSuccess: () => void;
}) => {
    const handleRemoveMember = async () => {
        try {
            if (memberToRemove && memberToRemove.uid && memberToRemove.name && memberToRemove.uhUuid) {
                const membersToRemoveFinal = [memberToRemove.uid, memberToRemove.name, memberToRemove.uhUuid];
                console.log('Prepared removal array:', membersToRemoveFinal);
                console.log('Grouping Path:', groupingPath);

                switch (group) {
                    case 'include':
                        console.log('Removing from include members');
                        await removeIncludeMembers(membersToRemoveFinal, groupingPath);
                        break;
                    case 'exclude':
                        console.log('Removing from exclude members');
                        await removeExcludeMembers(membersToRemoveFinal, groupingPath);
                        break;
                    case 'owners':
                        console.log('Removing from owners');
                        await removeOwners(membersToRemoveFinal, groupingPath);
                        break;
                    default:
                        console.error('Unknown group type:', group);
                        return;
                }

                onSuccess();
                console.log('Member removal successful');
                onClose();
            } else {
                console.log(memberToRemove);
                console.log(group);
                console.error('Error: memberToRemove is undefined or missing properties.');
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent
                className="max-w-[484px] sm:max-w-[500px] max-h-[90vh] rounded flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    document.body.focus();
                }}
            >
                <AlertDialogHeader className="text-left">
                    <AlertDialogTitle className="text-[1.4rem]">Remove Member</AlertDialogTitle>
                    <AlertDialogCancel
                        onClick={onClose}
                        className={`
                          absolute px-4 top-0 right-0 text-[1.5rem] font-bold text-input-text-grey 
                          hover:text-red-500 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 border-none
                        `}
                        variant="ghost"
                        aria-label="Close"
                    >
                        &times;
                    </AlertDialogCancel>
                </AlertDialogHeader>
                <div className="flex-1 overflow-y-auto">
                    {membersNotInList?.length > 0 && (
                        <div className="flex items-center justify-start">
                            <AlertDialogDescription className="py-0">
                                Not in <span className="capitalize">{group}</span>:
                            </AlertDialogDescription>
                            <div className="max-w-[330px] max-h-[100px] rounded-md overflow-x-auto overflow-y-auto">
                                <div
                                    className={`whitespace-nowrap min-w-0 ${membersNotInList.join(', ').length > 41 ? 'mt-4' : ''}`}
                                >
                                    {membersNotInList.join(', ')}
                                </div>
                            </div>
                        </div>
                    )}
                    <AlertDialogDescription>
                        You are about to remove the following member from the{' '}
                        <span className="capitalize">{group}</span> list.
                    </AlertDialogDescription>
                    <div className="grid grid-cols-2">
                        <div className="grid">
                            <div className="grid grid-cols-3 items-center py-1 px-4">
                                <Label className="font-bold text-s text-left whitespace-nowrap">NAME:</Label>
                            </div>
                            <div className="grid grid-cols-3 items-center py-1 px-4">
                                <Label className="font-bold text-s text-left whitespace-nowrap">UH NUMBER:</Label>
                            </div>
                            <div className="grid grid-cols-3 items-center py-1 px-4">
                                <Label className="font-bold text-s text-left whitespace-nowrap">UH USERNAME:</Label>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="grid grid-cols-3 items-center">
                                <Label className="text-s text-left whitespace-nowrap">
                                    {String(memberToRemove.name)}
                                </Label>
                            </div>
                            <div className="grid grid-cols-4 items-center">
                                <Label className="text-s text-left whitespace-nowrap">
                                    {String(memberToRemove.uhUuid)}
                                </Label>
                            </div>
                            <div className="grid grid-cols-4 items-center">
                                <Label className="text-s text-left whitespace-nowrap">
                                    {String(memberToRemove.uid).trim() === 'N/A' ? (
                                        <span>
                                            N/A{' '}
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <FontAwesomeIcon
                                                                icon={faCircleQuestion}
                                                                className="text-text-color"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-48 text-center whitespace-normal p-1 !border-none !shadow-none">
                                                        ??screen.message.common.tool tip.username.notApplicable_e n_US??
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </span>
                                    ) : (
                                        String(memberToRemove.uid)
                                    )}
                                </Label>
                            </div>
                        </div>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to remove{' '}
                        <span className="font-bold text-text-color">{memberToRemove.name}</span> from the{' '}
                        <span className="capitalize">{group}</span> list?
                    </AlertDialogDescription>
                    <div className="px-3">
                        <Alert className="bg-yellow-100 border border-yellow-200 mb-2">
                            <AlertDescription>
                                Membership changes made may not take effect immediately. Usually, 3-5 minutes should be
                                anticipated. In extreme cases changes may take several hours to be fully processed,
                                depending on the number of members and the synchronization destination.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
                <AlertDialogFooter className={`flex flex-row justify-end space-x-2 px-4 pt-4 border-t`}>
                    <AlertDialogAction onClick={handleRemoveMember}>Yes</AlertDialogAction>
                    <AlertDialogCancel onClick={onClose} className={`mt-0`}>
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default RemoveMemberModal;
