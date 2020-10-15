import './builder.test';
import './chain.test';
import './generic.test';
import './lifecycle.test';
import './messaging.test';
import './misc.test';
import './search.test';


import { TestRunner } from './test-runner';
import { allTests } from './test-collector';

export default new TestRunner(allTests);