import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ORPHAN_HELP_URL } from '@/lib/member-utils';
import { message } from '@/lib/messages';

/**
 * Shown in place of an orphan's name, which is Grouper's "entity not found" placeholder.
 * Renders "N/A" and an info icon that links to the Missing Member Names help page.
 */
const OrphanMemberName = () => (
    <span className="text-text-color">
        N/A{' '}
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={ORPHAN_HELP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={message.Tooltip.ORPHAN_HELP_ARIA}
                    >
                        <FontAwesomeIcon icon={faInfoCircle} color="black" />
                    </a>
                </TooltipTrigger>
                <TooltipContent className="max-w-48 text-center whitespace-normal" side="right">
                    {message.Tooltip.ORPHAN}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </span>
);

export default OrphanMemberName;
