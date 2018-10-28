interface Action<T>
{
    (item: T): void;
}

interface Func<T,TResult>
{
    (item: T): TResult;
}