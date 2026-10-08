import { table } from '../lib/table';
import { createCrudRouter } from '../lib/crud';

export default createCrudRouter(table('courses', 'name'));
