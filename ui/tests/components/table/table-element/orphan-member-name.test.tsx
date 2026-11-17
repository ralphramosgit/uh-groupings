import OrphanMemberName from '@/components/table/table-element/orphan-member-name';
import { ORPHAN_HELP_URL } from '@/lib/member-utils';
import { message } from '@/lib/messages';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Render the tooltip content right away, so its text can be checked without hovering.
vi.mock('@/components/ui/tooltip', () => ({
    TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: ReactNode }) => <div data-testid="tooltip-content">{children}</div>
}));

describe('OrphanMemberName', () => {
    it('should render N/A in place of the name', () => {
        render(<OrphanMemberName />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should link to the Missing Member Names help page in a new tab', () => {
        render(<OrphanMemberName />);
        const link = screen.getByRole('link', { name: message.Tooltip.ORPHAN_HELP_ARIA });

        expect(link).toHaveAttribute('href', ORPHAN_HELP_URL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show the orphan tooltip text', () => {
        render(<OrphanMemberName />);
        expect(screen.getByTestId('tooltip-content')).toHaveTextContent(message.Tooltip.ORPHAN);
    });
});
