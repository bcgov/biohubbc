import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton, Link, Menu, MenuItem } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface SubcollectionItem {
  collection_id: number;
  name: string;
  subcollections?: SubcollectionItem[];
}

interface SubMenuProps {
  items: SubcollectionItem[];
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SubMenu = ({ items, anchorEl, onClose, onMouseEnter, onMouseLeave }: SubMenuProps) => {
  const [hoveredSubId, setHoveredSubId] = useState<number | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (subId: number, element: HTMLElement) => {
    clearCloseTimeout();
    setHoveredSubId(subId);
    setSubmenuAnchorEl(element);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setHoveredSubId(null);
      setSubmenuAnchorEl(null);
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    clearCloseTimeout();
    onMouseEnter?.();
  };

  const handleMenuMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
      onMouseLeave?.();
    }, 150);
  };

  const handleSubmenuClose = () => {
    setHoveredSubId(null);
    setSubmenuAnchorEl(null);
  };

  const handleSubmenuMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleSubmenuMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
      onMouseLeave?.();
    }, 150);
  };

  const hoveredItem = items.find((item) => item.collection_id === hoveredSubId);
  const hasNestedItems = hoveredItem?.subcollections && hoveredItem.subcollections.length > 0;

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {}} // Prevent backdrop close
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 220,
            zIndex: (theme) => theme.zIndex.modal + 1
          }
        }}>
        {items.map((item) => {
          const hasChildren = item.subcollections && item.subcollections.length > 0;
          return (
            <MenuItem
              key={item.collection_id}
              onMouseEnter={(e) => handleMouseEnter(item.collection_id, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <Link
                component={RouterLink}
                to={`/admin/collections/${item.collection_id}`}
                underline="hover"
                sx={{
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}>
                {item.name}
              </Link>

              {hasChildren && (
                <Icon
                  path={mdiChevronRight}
                  size={0.75}
                  style={{
                    marginLeft: 8,
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Render nested submenu */}
      {hasNestedItems && hoveredItem && (
        <SubMenu
          items={hoveredItem.subcollections!}
          anchorEl={submenuAnchorEl}
          onClose={handleSubmenuClose}
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
        />
      )}
    </>
  );
};

export const SubcollectionMenuButton = ({
  collectionId,
  onMouseEnter
}: {
  collectionId: number;
  onMouseEnter: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const biohubApi = useBiohubApi();
  const subcollectionsLoader = useDataLoader(() => biohubApi.collection.getCollection(collectionId));

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    clearCloseTimeout();
    setAnchorEl(event.currentTarget);
    subcollectionsLoader.load();
  };

  const closeMenu = () => {
    setAnchorEl(null);
    clearCloseTimeout();
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    clearCloseTimeout();
    setAnchorEl(event.currentTarget);
    subcollectionsLoader.load();
  };

  const handleButtonMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      closeMenu();
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleMenuMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      closeMenu();
    }, 150);
  };

  const subcollections = subcollectionsLoader.data?.subcollections || [];

  return (
    <>
      <IconButton
        size="small"
        onClick={openMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        color="primary">
        <Icon path={mdiChevronDown} size={0.85} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ '& .MuiPaper-root': { minWidth: 220 } }}>
        <LoadingGuard isLoading={subcollectionsLoader.isLoading} isLoadingFallback={<SkeletonList />}>
          {subcollections.map((sub) => {
            const hasChildren = sub.subcollections && sub.subcollections.length > 0;
            return (
              <MenuItem
                key={sub.collection_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                <Link
                  component={RouterLink}
                  to={`/admin/collections/${sub.collection_id}`}
                  underline="hover"
                  sx={{
                    flexGrow: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}>
                  {sub.name}
                </Link>

                {hasChildren && (
                  <>
                    <Icon
                      path={mdiChevronRight}
                      size={0.75}
                      style={{
                        marginLeft: 8,
                        opacity: 0.6,
                        transition: 'opacity 0.2s'
                      }}
                    />
                    <SubMenu
                      items={sub.subcollections!}
                      anchorEl={anchorEl}
                      onClose={() => {}}
                      onMouseEnter={handleMenuMouseEnter}
                      onMouseLeave={handleMenuMouseLeave}
                    />
                  </>
                )}
              </MenuItem>
            );
          })}
        </LoadingGuard>
      </Menu>
    </>
  );
};
