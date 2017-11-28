#pragma once

/**
 * A simple wrapper for vector<T> used in Lua scripts
 */
template<typename T>
class List {
public:
	List() {}
	List(const std::vector<T>* initialValues) {
		for (auto i = initialValues->begin(); i != initialValues->end(); i++) {
			mWrappedVector.push_back(*i);
		}
	}
	~List() {}

	void Push(T value) { mWrappedVector.push_back(value); }
	T At(int index) { return mWrappedVector.at(index); }
	int Size() { return mWrappedVector.size(); }
	bool Empty() { return mWrappedVector.empty(); }

private:
	std::vector<T> mWrappedVector;
};
