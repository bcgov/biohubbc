import { mdiChevronDown, mdiChevronUp, mdiMinusCircle } from '@mdi/js';
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
const CollapsibleCardList = <T extends { label: string; id?: string | number }>(props: CollapsibleCardListProps<T>) => {
  const { items, renderCardContent, selectedItems = [], onSelectItem } = props;

  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <Box sx={{ maxHeight: '1200px', overflowY: 'auto' }}>
      <TransitionGroup>
        {items.map((item, index) => (
          <Collapse key={item.id}>
            <Box display="flex" flex="1 1 auto" alignItems="center" mb={2}>
              <Paper
                sx={{
                  flex: '1 1 auto',
                  p: 2,
                  bgcolor: selectedItems.some((selected) => selected.id === item.id) ? '#e3f2fd' : grey[50]
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
                        checked={selectedItems.some((selected) => selected.id === item.id)}
                        onClick={(event) => {
                          onSelectItem(item);
                          event.stopPropagation();
                        }}
                      />
                    )}
                    <Typography fontWeight={700}>{item.label}</Typography>
                  </Box>

                  <IconButton color="primary">
                    <Icon path={expandedIndexes.includes(index) ? mdiChevronUp : mdiChevronDown} size={1} />
                  </IconButton>
                </Box>

                {/* Expandable Form Content */}
                <Collapse in={expandedIndexes.includes(index)} unmountOnExit>
                  <Box mt={3}>{renderCardContent(item, index)}</Box>
                </Collapse>
              </Paper>

              <IconButton color="error" sx={{ mx: 1 }}>
                <Icon path={mdiMinusCircle} size={1} />
              </IconButton>
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
};

export default CollapsibleCardList;
