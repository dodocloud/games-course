import { BaseTest, TestFunc } from './test-runner';

export const allTests: BaseTest[] = [];

export const addTest = (name: string, func: TestFunc) => {
	allTests.push(new BaseTest(name, func));
};