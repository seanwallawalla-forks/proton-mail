import React from 'react';
import { Icon, DropdownMenu, DropdownMenuButton, ToolbarButton } from 'react-components';
import { c } from 'ttag';

import ToolbarDropdown from './ToolbarDropdown';

import { Page } from '../../models/tools';
import { usePaging } from '../../hooks/usePaging';

interface Props {
    loading: boolean;
    page: Page;
    onPage: (page: number) => void;
}

const PagingControls = ({ loading, page: inputPage, onPage: inputOnPage }: Props) => {
    const { onPrevious, onNext, onPage, page, total } = usePaging(inputPage, inputOnPage);

    return (
        <>
            <ToolbarButton
                disabled={loading || page <= 1}
                title={c('Action').t`Previous page`}
                onClick={onPrevious}
                className="no-tablet no-mobile"
                icon={<Icon className="rotateZ-90" name="caret" alt={c('Action').t`Previous page`} />}
            />
            <ToolbarDropdown
                title={c('Action').t`Change page`}
                content={String(page)}
                disabled={total <= 1}
                size="narrow"
            >
                {() => (
                    <DropdownMenu>
                        {[...Array(total)].map((_, i) => {
                            const pageNumber = i + 1; // paging tooling is 0 based
                            return (
                                <DropdownMenuButton
                                    key={i} // eslint-disable-line react/no-array-index-key
                                    loading={loading}
                                    disabled={page - 1 === i}
                                    onClick={() => onPage(i + 1)}
                                    aria-label={c('Action').t`Page ${pageNumber}`}
                                >
                                    {pageNumber}
                                </DropdownMenuButton>
                            );
                        })}
                    </DropdownMenu>
                )}
            </ToolbarDropdown>
            <ToolbarButton
                disabled={loading || page >= total}
                title={c('Action').t`Next page`}
                onClick={onNext}
                className="no-tablet no-mobile"
                icon={<Icon className="rotateZ-270" name="caret" alt={c('Action').t`Next page`} />}
            />
        </>
    );
};

export default PagingControls;
