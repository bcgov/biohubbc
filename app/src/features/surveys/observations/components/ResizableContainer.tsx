import { mdiDragHorizontal } from '@mdi/js';
import { Icon } from '@mdi/react';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import React, { useEffect, useRef, useState } from 'react';

interface IResizableContainerProps {
  children: React.ReactNode;
}

const ResizableContainer = (props: IResizableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState(0);
  const [bottomPanelPos, setBottomPanelPos] = useState(0);

  const [isResizing, setResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResizing(true);
    setMousePos(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && containerRef.current?.getBoundingClientRect()) {
      const deltaY = bottomPanelPos + (mousePos - e.clientY) / 2;
      const newHeight = Math.min(deltaY, 250);
      containerRef.current.style.height = `${newHeight}%`;
      setBottomPanelPos(newHeight);
    }
  };

  const handleMouseUp = () => {
    setResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Box position="relative" height="200px" minHeight="100px" overflow="hidden" ref={containerRef}>
      <Box
        ref={handleRef}
        onMouseDown={handleMouseDown}
        bgcolor={grey[200]}
        height='10px'
        sx={{
          justifyContent: 'center',
          cursor: 'ns-resize',
          alignItems: 'center',
          display: 'flex',
          zIndex: 1000 // Adjust the zIndex based on your layout
        }}>
        <Box px={2} display="flex" justifyContent="center" borderRadius="5px" bgcolor={grey[200]} alignItems="center">
          <Icon path={mdiDragHorizontal} size={1} color={grey[700]} />
        </Box>
      </Box>
      {props.children}
    </Box>
  );
};

export default ResizableContainer;
