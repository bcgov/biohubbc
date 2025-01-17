import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Checkbox, Collapse, IconButton, Paper, Typography } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

export interface CollapsibleCardListProps<T> {
  /**
   * Items to disply as cards
   */
  items: T[];
  /**
   * The content of each card, typically a form
   *
   * @param item
   * @param index
   * @returns
   */
  renderCardContent: (item: T, index: number) => React.ReactNode;
  /**
   * Selected items, used to change the background colour for selected items
   */
  selectedItems?: T[];
  /**
   * Handler for when a card item is selected
   * @param item
   */
  onSelectItem?: (item: T) => void;
  /**
   * Handler for when all card items are selected using the 'Select All' button in the toolbar
   */
  onSelectAll?: () => void;
  /**
   * Whether to hide the toolbar for expanding/collapsing and selecting all items. If hideToolbar is false and onSelectItem is undefined, 
   * cards do not appear to be selectable.
   */
  hideToolbar?: boolean;
}

/**
 * Returns a list of cards that can each contain a form component, used when adding features to a map
 * and needing to edit the properties of each feature (eg. name and description)
 *
 * @param {CollapsibleCardListProps} props
 * @returns {*}
 */
const CollapsibleCardList = <T extends { label: string; uuid?: string }>(props: CollapsibleCardListProps<T>) => {
  const { items, renderCardContent, selectedItems = [], onSelectItem} = props;
  const [collapsedIndexes, setCollapsedIndexes] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setCollapsedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  // Checkbox state to determine which icon to display in the checkbox
  // (minus sign if a subset of items are selected, checkmark sign if all items selected, like MUI's default for datagrid row selection)
  // const allSelected = selectedItems.length === items.length;
  // const indeterminate = selectedItems.length > 0 && !allSelected;

  // const toggleExpandCollapseAll = () => {
  //   if (collapsedIndexes.length === 0) {
  //     setCollapsedIndexes(items.map((_, idx) => idx));
  //   } else {
  //     setCollapsedIndexes([]);
  //   }
  // };

  // const allCollapsed = collapsedIndexes.length === items.length;

  return (
    <>
      {/* Action Buttons
      {!hideToolbar && (
        <Box
          display="flex"
          justifyContent="space-between"
          mb={2}
          sx={{ '& .MuiButton-root': { bgcolor: '#f9f9f9', color: '#333' } }}>
          <Button variant="text" onClick={onSelectAll}>
            <Checkbox
              color="primary"
              indeterminate={indeterminate}
              checked={selectedItems.length === items.length}
              sx={{ p: 0, mr: 1 }}
            />
            Select All
          </Button>
          <Button variant="text" onClick={toggleExpandCollapseAll}>
            {allCollapsed ? 'Expand All' : 'Collapse All'}
          </Button>
        </Box>
      )} */}

      {/* List of Items */}
      <Box sx={{ maxHeight: '1000px', overflowY: 'auto' }}>
        <TransitionGroup>
          {items.map((item, index) => (
            <Collapse key={item.uuid}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: selectedItems.some((selected) => selected.uuid === item.uuid) ? '#e3f2fd' : grey[50]
                }}
                variant="outlined">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => toggleExpand(index)}
                  sx={{ cursor: 'pointer' }}>
                  <Box display="flex" alignItems="center">
                    {onSelectItem && (
                      <Checkbox
                        color="primary"
                        checked={selectedItems.some((selected) => selected.uuid === item.uuid)}
                        onClick={(event) => {
                          onSelectItem(item);
                          event.stopPropagation();
                        }}
                      />
                    )}
                    <Typography fontWeight={700}>{item.label}</Typography>
                  </Box>

                  {/* Expand/Collapse */}
                  <IconButton color="primary">
                    <Icon path={collapsedIndexes.includes(index) ? mdiChevronDown : mdiChevronUp} size={1} />
                  </IconButton>
                </Box>

                {/* Expandable Content */}
                <Collapse in={!collapsedIndexes.includes(index)} unmountOnExit>
                  <Box mt={3}>{renderCardContent(item, index)}</Box>
                </Collapse>
              </Paper>
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>
    </>
  );
};

export default CollapsibleCardList;
