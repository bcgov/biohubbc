import ReactDOM from 'react-dom';
import React from 'react';
import { LoadingButton } from '@mui/lab';


export const openChecklist = () => {
  let popup = document.getElementById('checklistPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'checklistPopup';
    popup.style.cssText = `
      position: fixed;
      bottom: 50px;
      right: 5px;
      transform: translate(-10%, -10%);
      width: 300px;
      background: white;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      z-index: 1000;
    `;

    const PopupContent = () => {
      const handleClose = () => {
        if (popup) {
          document.body.removeChild(popup);
        }
      };

      return (
        <div>
          <h3>Action Items</h3>
          <ul>
            <li>Code in Variable checklists</li>
            <li>change formatting to match others</li>
            <li>open dialog as opposed to popup?</li>
          </ul>
          <LoadingButton
            onClick={handleClose}
            color="primary"
            variant="contained"
            loading={false} 
            sx={{
              display: 'block',
              margin: '10px auto',
            }}
          >
            Close
          </LoadingButton>
        </div>
      );
    };

    ReactDOM.render(<PopupContent />, popup);

    document.body.appendChild(popup);
  }
};
