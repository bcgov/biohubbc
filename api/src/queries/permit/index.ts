import * as permitCreate from './permit-create-queries';
import * as permitUpdate from './permit-update-queries';
import * as permitView from './permit-view-queries';

export default { ...permitCreate, ...permitUpdate, ...permitView };
