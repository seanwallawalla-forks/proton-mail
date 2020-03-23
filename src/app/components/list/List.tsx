import React, { useState, ChangeEvent, DragEvent } from 'react';
import { c, msgid } from 'ttag';
import { Location } from 'history';
import { useLabels, useContactEmails, useContactGroups } from 'react-components';

import Item from './Item';
import { Element } from '../../models/element';
import EmptyView from '../view/EmptyView';
import { ContactEmail } from '../../models/contact';
import { DRAG_ELEMENT_KEY } from '../../constants';
import { isMessage as testIsMessage } from '../../helpers/elements';

import './Drag.scss';

interface Props {
    labelID: string;
    elementID?: string;
    mailSettings: any;
    elements?: Element[];
    checkedIDs?: string[];
    onCheck: (ID: string[], checked: boolean, replace: boolean) => void;
    onClick: (element: Element) => void;
    location: Location;
}

const List = ({
    labelID,
    elementID,
    mailSettings = {},
    elements = [],
    checkedIDs = [],
    onCheck,
    onClick,
    location
}: Props) => {
    const [contacts = [], loadingContacts] = useContactEmails() as [ContactEmail[] | undefined, boolean, Error];
    const [contactGroups = [], loadingGroups] = useContactGroups();
    const [labels] = useLabels();
    const [lastChecked, setLastChecked] = useState<string>(); // Store ID of the last element ID checked
    const [dragElement, setDragElement] = useState<HTMLDivElement>();
    const [savedCheck, setSavedCheck] = useState<string[]>();

    if (loadingContacts || loadingGroups) {
        return null;
    }

    const handleCheck = (elementID: string) => (event: ChangeEvent) => {
        const target = event.target as HTMLInputElement;
        const { shiftKey } = event.nativeEvent as any;
        const elementIDs = [elementID];

        if (lastChecked && shiftKey) {
            const start = elements.findIndex(({ ID }) => ID === elementID);
            const end = elements.findIndex(({ ID }) => ID === lastChecked);
            elementIDs.push(
                ...elements.slice(Math.min(start, end), Math.max(start, end) + 1).map(({ ID }) => ID || '')
            );
        }

        setLastChecked(elementID);
        onCheck(elementIDs, target.checked, false);
    };

    const handleDragStart = (element: Element) => (event: DragEvent) => {
        const elementID = element.ID || '';
        const dragInSelection = checkedIDs.includes(elementID);
        const selection = dragInSelection ? checkedIDs : [elementID];

        if (!dragInSelection) {
            setSavedCheck(checkedIDs);
            onCheck(selection, true, true);
        }

        const isMessage = testIsMessage(element);
        const dragElement = document.createElement('div');
        dragElement.innerHTML = isMessage
            ? c('Success').ngettext(
                  msgid`Move ${selection.length} message`,
                  `Move ${selection.length} messages`,
                  selection.length
              )
            : c('Success').ngettext(
                  msgid`Move ${selection.length} conversation`,
                  `Move ${selection.length} conversations`,
                  selection.length
              );
        dragElement.className = 'drag-element p1 bordered-container rounded';
        document.body.appendChild(dragElement);
        event.dataTransfer.setDragImage(dragElement, 0, 0);
        event.dataTransfer.setData(DRAG_ELEMENT_KEY, JSON.stringify(selection));
        setDragElement(dragElement);
    };

    const handleDragEnd = (event: DragEvent) => {
        if (dragElement) {
            document.body.removeChild(dragElement);
            setDragElement(undefined);
        }
        const action = event.dataTransfer.dropEffect;
        if (action !== 'none') {
            onCheck([], true, true);
        }
        if (savedCheck) {
            if (action === 'none') {
                onCheck(savedCheck, true, true);
            }
            setSavedCheck(undefined);
        }
    };

    return elements.length === 0 ? (
        <EmptyView labelID={labelID} />
    ) : (
        <>
            {elements.map((element) => {
                return (
                    <Item
                        location={location}
                        labels={labels}
                        labelID={labelID}
                        key={element.ID}
                        elementID={elementID}
                        element={element}
                        checked={checkedIDs.includes(element.ID || '')}
                        contacts={contacts}
                        contactGroups={contactGroups}
                        onCheck={handleCheck(element.ID || '')}
                        onClick={onClick}
                        mailSettings={mailSettings}
                        onDragStart={handleDragStart(element)}
                        onDragEnd={handleDragEnd}
                    />
                );
            })}
        </>
    );
};

export default List;
