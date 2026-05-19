namespace PSP.BusinessLayer.Core;

public sealed class BusinessException : Exception
{
    public BusinessException(int statusCode, string message)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
